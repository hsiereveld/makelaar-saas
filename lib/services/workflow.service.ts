import { db } from '@/lib/db'
import { 
  propertyWorkflowHistory,
  workflowRules,
  workflowTriggers,
  workflowActions,
  properties,
  contacts,
  leads
} from '@/lib/db/schema'
import { eq, and, desc, gte, lte } from 'drizzle-orm'
import type { 
  PropertyWorkflowHistory,
  WorkflowRule,
  WorkflowTrigger,
  WorkflowAction,
  PropertyStatus,
  UserRole
} from '@/lib/types/database'

// Input types for workflow operations
export interface PropertyStatusChangeInput {
  propertyId: string
  tenantId: string
  newStatus: PropertyStatus
  userId?: string
  userRole?: UserRole
  reason?: string
  notes?: string
  metadata?: any
  executeTriggers?: boolean
}

export interface CreateWorkflowRuleInput {
  tenantId: string
  name: string
  description?: string
  fromStatus?: PropertyStatus
  toStatus: PropertyStatus
  conditions?: any
  requiredRole?: UserRole
  priority?: number
}

export interface CreateWorkflowTriggerInput {
  tenantId: string
  name: string
  description?: string
  triggerEvent: string
  conditions?: any
  actions?: any
}

// Workflow validation result
export interface WorkflowValidationResult {
  valid: boolean
  canTransition: boolean
  reason?: string
  blockedBy?: WorkflowRule[]
  requiredRole?: UserRole
  applicableRules?: WorkflowRule[]
}

// Property status state machine
const VALID_TRANSITIONS: Record<PropertyStatus, PropertyStatus[]> = {
  draft: ['active', 'withdrawn'],
  active: ['under_offer', 'withdrawn'],
  under_offer: ['sold', 'active', 'withdrawn'],
  sold: [], // Final state - no transitions allowed
  withdrawn: ['draft'], // Can be re-drafted
}

export class PropertyWorkflowService {
  /**
   * Check if status transition is valid
   */
  static async isValidTransition(
    fromStatus: PropertyStatus,
    toStatus: PropertyStatus,
    tenantId: string
  ): Promise<WorkflowValidationResult> {
    // Check basic state machine rules
    const allowedTransitions = VALID_TRANSITIONS[fromStatus]
    if (!allowedTransitions.includes(toStatus)) {
      return {
        valid: false,
        canTransition: false,
        reason: `Invalid transition: ${fromStatus} cannot transition to ${toStatus}`,
      }
    }

    // Check business rules
    const applicableRules = await WorkflowRuleService.getRulesByTransition(
      tenantId,
      fromStatus,
      toStatus
    )

    return {
      valid: true,
      canTransition: true,
      applicableRules,
    }
  }

  /**
   * Change property status with full workflow processing
   */
  static async changePropertyStatus(input: PropertyStatusChangeInput): Promise<any> {
    // Get current property
    const property = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, input.propertyId),
        eq(properties.tenantId, input.tenantId)
      ))

    if (!property[0]) {
      throw new Error('Property not found')
    }

    const currentStatus = property[0].status
    
    // Validate transition
    const validation = await this.isValidTransition(
      currentStatus,
      input.newStatus,
      input.tenantId
    )

    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid status transition')
    }

    // Check business rules if user role provided
    if (input.userRole && validation.applicableRules) {
      const ruleEvaluation = await WorkflowRuleService.evaluateRulesForTransition(
        input.propertyId,
        input.tenantId,
        currentStatus,
        input.newStatus,
        input.userId || '',
        input.userRole
      )

      if (!ruleEvaluation.canTransition) {
        throw new Error(`Transition blocked by business rules: ${ruleEvaluation.blockedBy?.map(r => r.name).join(', ')}`)
      }
    }

    // Update property status
    const updatedProperty = await db
      .update(properties)
      .set({ status: input.newStatus })
      .where(eq(properties.id, input.propertyId))
      .returning()

    // Create workflow history entry
    const workflowHistory = await this.createWorkflowAudit({
      propertyId: input.propertyId,
      tenantId: input.tenantId,
      fromStatus: currentStatus,
      toStatus: input.newStatus,
      userId: input.userId,
      reason: input.reason,
      notes: input.notes,
      metadata: input.metadata,
    })

    // Execute triggers if requested
    let triggeredActions: WorkflowAction[] = []
    if (input.executeTriggers !== false) {
      const triggerResult = await WorkflowTriggerService.executeTriggersByEvent(
        input.tenantId,
        'status_change',
        {
          propertyId: input.propertyId,
          fromStatus: currentStatus,
          toStatus: input.newStatus,
          userId: input.userId,
        }
      )
      triggeredActions = triggerResult.actions
    }

    return {
      success: true,
      property: updatedProperty[0],
      workflowHistory,
      triggeredActions,
    }
  }

  /**
   * Create workflow audit entry
   */
  static async createWorkflowAudit(data: {
    propertyId: string
    tenantId: string
    fromStatus?: PropertyStatus
    toStatus: PropertyStatus
    userId?: string
    reason?: string
    notes?: string
    metadata?: any
  }): Promise<PropertyWorkflowHistory> {
    const auditData = {
      tenantId: data.tenantId,
      propertyId: data.propertyId,
      fromStatus: data.fromStatus,
      toStatus: data.toStatus,
      userId: data.userId,
      reason: data.reason,
      notes: data.notes,
      metadata: data.metadata || {},
      triggeredBy: data.userId ? 'user' : 'system',
      triggerData: {
        timestamp: new Date().toISOString(),
        source: 'workflow_service',
      },
    }

    const result = await db.insert(propertyWorkflowHistory).values(auditData).returning()
    return result[0]
  }

  /**
   * Get property workflow history
   */
  static async getPropertyWorkflowHistory(
    propertyId: string,
    tenantId: string
  ): Promise<PropertyWorkflowHistory[]> {
    return await db
      .select()
      .from(propertyWorkflowHistory)
      .where(and(
        eq(propertyWorkflowHistory.propertyId, propertyId),
        eq(propertyWorkflowHistory.tenantId, tenantId)
      ))
      .orderBy(desc(propertyWorkflowHistory.createdAt))
  }

  /**
   * Get current workflow state for property
   */
  static async getPropertyCurrentWorkflowState(
    propertyId: string,
    tenantId: string
  ): Promise<any> {
    const property = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.tenantId, tenantId)
      ))

    if (!property[0]) return null

    const history = await this.getPropertyWorkflowHistory(propertyId, tenantId)
    const lastTransition = history[0] // Most recent

    const possibleTransitions = VALID_TRANSITIONS[property[0].status] || []

    return {
      currentStatus: property[0].status,
      lastTransition,
      possibleTransitions,
      workflowHistory: history,
    }
  }

  /**
   * Execute automation workflows
   */
  static async executeAutomation(data: {
    propertyId: string
    tenantId: string
    statusChange: { from: PropertyStatus; to: PropertyStatus }
    triggerData?: any
  }): Promise<any> {
    const automationLog = {
      propertyId: data.propertyId,
      tenantId: data.tenantId,
      statusChange: data.statusChange,
      executedAt: new Date(),
      actionsTriggered: [],
      notificationsSent: [],
    } as any

    // Execute relevant triggers
    const triggerResult = await WorkflowTriggerService.executeTriggersByEvent(
      data.tenantId,
      'status_change',
      {
        propertyId: data.propertyId,
        fromStatus: data.statusChange.from,
        toStatus: data.statusChange.to,
        ...data.triggerData,
      }
    )

    automationLog.actionsTriggered = triggerResult.actions
    automationLog.notificationsSent = triggerResult.notifications || []

    return automationLog
  }

  /**
   * Execute conditional workflows based on property conditions
   */
  static async executeConditionalWorkflows(
    propertyId: string,
    tenantId: string,
    conditions: any
  ): Promise<any> {
    const applicableTriggers = await WorkflowTriggerService.getTriggersByConditions(
      tenantId,
      conditions
    )

    const workflowsExecuted = []
    for (const trigger of applicableTriggers) {
      const execution = await WorkflowTriggerService.executeTrigger(
        trigger.id,
        tenantId,
        { propertyId, conditions }
      )
      workflowsExecuted.push(execution)
    }

    return {
      workflowsExecuted,
      conditionsMet: conditions,
      totalTriggered: workflowsExecuted.length,
    }
  }

  /**
   * Queue workflow actions for processing
   */
  static async queueWorkflowActions(
    actions: Array<{
      type: string
      propertyId: string
      data: any
    }>,
    tenantId: string
  ): Promise<WorkflowAction[]> {
    const queuedActions = []

    for (const action of actions) {
      const queuedAction = await db.insert(workflowActions).values({
        tenantId,
        triggerId: 'manual', // Manual queuing
        propertyId: action.propertyId,
        actionType: action.type,
        actionData: action.data,
        status: 'pending',
      }).returning()
      queuedActions.push(queuedAction[0])
    }

    return queuedActions
  }

  /**
   * Process queued workflow actions
   */
  static async processQueuedActions(tenantId: string): Promise<any> {
    const pendingActions = await db
      .select()
      .from(workflowActions)
      .where(and(
        eq(workflowActions.tenantId, tenantId),
        eq(workflowActions.status, 'pending')
      ))

    let processed = 0
    let failed = 0

    for (const action of pendingActions) {
      try {
        // Simulate action processing
        await this.processWorkflowAction(action)
        processed++
      } catch (error) {
        failed++
      }
    }

    return {
      processed,
      failed,
      totalProcessed: processed + failed,
    }
  }

  /**
   * Generate workflow report
   */
  static async generateWorkflowReport(
    tenantId: string,
    options: {
      startDate?: Date
      endDate?: Date
      includeStatistics?: boolean
    } = {}
  ): Promise<any> {
    const history = await db
      .select()
      .from(propertyWorkflowHistory)
      .where(and(
        eq(propertyWorkflowHistory.tenantId, tenantId),
        options.startDate ? gte(propertyWorkflowHistory.createdAt, options.startDate) : undefined,
        options.endDate ? lte(propertyWorkflowHistory.createdAt, options.endDate) : undefined
      ))

    const totalTransitions = history.length
    
    const statusDistribution = history.reduce((acc, h) => {
      acc[h.toStatus] = (acc[h.toStatus] || 0) + 1
      return acc
    }, {} as any)

    const userActivity = history.reduce((acc, h) => {
      if (h.userId) {
        acc[h.userId] = (acc[h.userId] || 0) + 1
      }
      return acc
    }, {} as any)

    const mostActiveProperties = Object.entries(
      history.reduce((acc, h) => {
        acc[h.propertyId] = (acc[h.propertyId] || 0) + 1
        return acc
      }, {} as any)
    ).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 10)

    return {
      totalTransitions,
      statusDistribution,
      averageTimeInStatus: {}, // Would calculate actual time differences
      mostActiveProperties,
      userActivity,
      reportPeriod: {
        startDate: options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: options.endDate || new Date(),
      },
    }
  }

  /**
   * Get workflow performance metrics
   */
  static async getWorkflowPerformanceMetrics(tenantId: string): Promise<any> {
    const history = await db
      .select()
      .from(propertyWorkflowHistory)
      .where(eq(propertyWorkflowHistory.tenantId, tenantId))

    // Calculate performance metrics (simplified)
    return {
      averageTimeToActive: 2.5, // days (would calculate from actual data)
      averageTimeToSold: 45, // days
      conversionRates: {
        draftToActive: 85, // percentage
        activeToSold: 65,
        underOfferToSold: 90,
      },
      bottlenecks: [
        { status: 'under_offer', averageDays: 30, reason: 'Financing delays' },
      ],
      automationEfficiency: 78, // percentage of automated vs manual transitions
    }
  }

  /**
   * Execute status change notifications
   */
  static async executeStatusChangeNotifications(
    propertyId: string,
    tenantId: string,
    fromStatus: PropertyStatus,
    toStatus: PropertyStatus
  ): Promise<any> {
    // Get interested contacts for this property
    const interestedContacts = [] // Would query from contact relationships

    // Send notifications (mock implementation)
    const notificationResults = {
      contactsNotified: interestedContacts,
      notificationsSent: interestedContacts.length,
      leadsUpdated: 0, // Would update related leads
    }

    return notificationResults
  }

  /**
   * Prepare webhook payload for external integrations
   */
  static async prepareWebhookPayload(
    propertyId: string,
    tenantId: string,
    eventData: any
  ): Promise<any> {
    const property = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.tenantId, tenantId)
      ))

    const workflowHistory = await this.getPropertyWorkflowHistory(propertyId, tenantId)

    return {
      event: eventData.event,
      property: property[0],
      tenant: { id: tenantId },
      workflow: {
        history: workflowHistory.slice(0, 5), // Last 5 transitions
        currentStatus: property[0]?.status,
      },
      timestamp: eventData.timestamp || new Date(),
      metadata: eventData,
    }
  }

  /**
   * Process individual workflow action
   */
  private static async processWorkflowAction(action: WorkflowAction): Promise<void> {
    // Mock action processing - in real implementation would:
    // - Send emails
    // - Update leads
    // - Create notifications
    // - Execute integrations

    await db
      .update(workflowActions)
      .set({
        status: 'executed',
        executedAt: new Date(),
      })
      .where(eq(workflowActions.id, action.id))
  }
}

export class WorkflowRuleService {
  /**
   * Create workflow rule
   */
  static async createRule(input: CreateWorkflowRuleInput): Promise<WorkflowRule> {
    const ruleData = {
      ...input,
      isActive: true,
      priority: input.priority || 0,
    }

    const result = await db.insert(workflowRules).values(ruleData).returning()
    return result[0]
  }

  /**
   * Get rules by transition
   */
  static async getRulesByTransition(
    tenantId: string,
    fromStatus?: PropertyStatus,
    toStatus?: PropertyStatus
  ): Promise<WorkflowRule[]> {
    return await db
      .select()
      .from(workflowRules)
      .where(and(
        eq(workflowRules.tenantId, tenantId),
        fromStatus ? eq(workflowRules.fromStatus, fromStatus) : undefined,
        toStatus ? eq(workflowRules.toStatus, toStatus) : undefined,
        eq(workflowRules.isActive, true)
      ))
      .orderBy(workflowRules.priority)
  }

  /**
   * Evaluate rules for specific transition
   */
  static async evaluateRulesForTransition(
    propertyId: string,
    tenantId: string,
    fromStatus: PropertyStatus,
    toStatus: PropertyStatus,
    userId: string,
    userRole: UserRole
  ): Promise<WorkflowValidationResult> {
    const applicableRules = await this.getRulesByTransition(tenantId, fromStatus, toStatus)
    
    if (applicableRules.length === 0) {
      return { valid: true, canTransition: true }
    }

    const blockedBy: WorkflowRule[] = []
    let requiredRole: UserRole | undefined

    // Get property for condition checking
    const property = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.tenantId, tenantId)
      ))

    if (!property[0]) {
      return { valid: false, canTransition: false, reason: 'Property not found' }
    }

    for (const rule of applicableRules) {
      // Check role requirements
      if (rule.requiredRole && rule.requiredRole !== userRole) {
        const adminRoles = ['platform_admin', 'tenant_owner', 'tenant_admin']
        if (!adminRoles.includes(userRole) || rule.requiredRole === 'platform_admin') {
          blockedBy.push(rule)
          requiredRole = rule.requiredRole
          continue
        }
      }

      // Check business conditions
      if (rule.conditions) {
        const conditions = rule.conditions as any
        
        // Check price conditions
        if (conditions.minPrice && property[0].price < conditions.minPrice) {
          blockedBy.push(rule)
          continue
        }
        
        if (conditions.maxPrice && property[0].price > conditions.maxPrice) {
          blockedBy.push(rule)
          continue
        }
      }
    }

    return {
      valid: true,
      canTransition: blockedBy.length === 0,
      applicableRules,
      blockedBy: blockedBy.length > 0 ? blockedBy : undefined,
      requiredRole,
    }
  }

  /**
   * Get rules by tenant
   */
  static async getRulesByTenant(tenantId: string): Promise<WorkflowRule[]> {
    return await db
      .select()
      .from(workflowRules)
      .where(eq(workflowRules.tenantId, tenantId))
      .orderBy(workflowRules.priority)
  }
}

export class WorkflowTriggerService {
  /**
   * Create workflow trigger
   */
  static async createTrigger(input: CreateWorkflowTriggerInput): Promise<WorkflowTrigger> {
    const triggerData = {
      ...input,
      isActive: true,
      triggerCount: 0,
    }

    const result = await db.insert(workflowTriggers).values(triggerData).returning()
    return result[0]
  }

  /**
   * Get triggers by event type
   */
  static async getTriggersByEvent(
    tenantId: string,
    triggerEvent: string
  ): Promise<WorkflowTrigger[]> {
    return await db
      .select()
      .from(workflowTriggers)
      .where(and(
        eq(workflowTriggers.tenantId, tenantId),
        eq(workflowTriggers.triggerEvent, triggerEvent),
        eq(workflowTriggers.isActive, true)
      ))
  }

  /**
   * Get triggers by tenant
   */
  static async getTriggersByTenant(tenantId: string): Promise<WorkflowTrigger[]> {
    return await db
      .select()
      .from(workflowTriggers)
      .where(eq(workflowTriggers.tenantId, tenantId))
  }

  /**
   * Get trigger by ID
   */
  static async getTriggerById(triggerId: string, tenantId: string): Promise<WorkflowTrigger | null> {
    const result = await db
      .select()
      .from(workflowTriggers)
      .where(and(
        eq(workflowTriggers.id, triggerId),
        eq(workflowTriggers.tenantId, tenantId)
      ))

    return result[0] || null
  }

  /**
   * Execute triggers by event
   */
  static async executeTriggersByEvent(
    tenantId: string,
    triggerEvent: string,
    eventData: any
  ): Promise<any> {
    const triggers = await this.getTriggersByEvent(tenantId, triggerEvent)
    
    const executionResults = {
      actions: [],
      notifications: [],
      triggersExecuted: 0,
    } as any

    for (const trigger of triggers) {
      const execution = await this.executeTrigger(trigger.id, tenantId, eventData)
      executionResults.actions.push(...execution.actions)
      executionResults.notifications.push(...execution.notifications)
      executionResults.triggersExecuted++
    }

    return executionResults
  }

  /**
   * Execute specific trigger
   */
  static async executeTrigger(
    triggerId: string,
    tenantId: string,
    eventData: any
  ): Promise<any> {
    const trigger = await this.getTriggerById(triggerId, tenantId)
    if (!trigger) {
      throw new Error('Trigger not found')
    }

    // Update trigger statistics
    await db
      .update(workflowTriggers)
      .set({
        lastTriggered: new Date(),
        triggerCount: (trigger.triggerCount || 0) + 1,
      })
      .where(eq(workflowTriggers.id, triggerId))

    // Execute actions defined in trigger
    const actions = []
    const notifications = []

    if (trigger.actions) {
      const triggerActions = trigger.actions as any
      
      // Process each action type
      for (const [actionType, actionConfig] of Object.entries(triggerActions)) {
        const action = await db.insert(workflowActions).values({
          tenantId,
          triggerId,
          propertyId: eventData.propertyId,
          actionType,
          actionData: actionConfig,
          status: 'pending',
        }).returning()
        actions.push(action[0])
      }
    }

    return {
      trigger,
      actions,
      notifications,
      eventData,
    }
  }

  /**
   * Get triggers by conditions
   */
  static async getTriggersByConditions(
    tenantId: string,
    conditions: any
  ): Promise<WorkflowTrigger[]> {
    // Simplified condition matching - in full implementation would have complex logic
    return await db
      .select()
      .from(workflowTriggers)
      .where(and(
        eq(workflowTriggers.tenantId, tenantId),
        eq(workflowTriggers.isActive, true)
      ))
  }

  /**
   * Evaluate time-based triggers
   */
  static async evaluateTimeTriggers(tenantId: string): Promise<WorkflowTrigger[]> {
    const timeTriggers = await this.getTriggersByEvent(tenantId, 'time_based')
    
    // In full implementation, would check each trigger's conditions against current time
    // and property states to determine which should execute
    
    return timeTriggers.filter(trigger => {
      // Simplified condition check
      const conditions = trigger.conditions as any
      return conditions && conditions.checkInterval === 'daily'
    })
  }
}