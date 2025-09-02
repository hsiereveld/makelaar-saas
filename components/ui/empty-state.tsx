import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-8 text-center",
      className
    )}>
      {Icon && (
        <div className="p-3 bg-neutral-100 rounded-full mb-4">
          <Icon className="h-8 w-8 text-neutral-400" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-business-body max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action}
        </div>
      )}
    </div>
  )
}

// Nederlandse Business Empty States
import { 
  Building2, 
  Users, 
  Search, 
  FileText, 
  Inbox, 
  Settings,
  Plus,
  Upload
} from "lucide-react"

const EmptyStates = {
  Properties: () => (
    <EmptyState
      icon={Building2}
      title="Nog geen panden"
      description="Begin met het toevoegen van je eerste pand aan het systeem om deze lijst te vullen."
      action={
        <Button variant="business">
          <Plus className="h-4 w-4" />
          Eerste Pand Toevoegen
        </Button>
      }
    />
  ),

  Contacts: () => (
    <EmptyState
      icon={Users}
      title="Nog geen contacten"
      description="Voeg contacten toe om je klantrelaties te beheren en leads bij te houden."
      action={
        <Button variant="business">
          <Plus className="h-4 w-4" />
          Eerste Contact Toevoegen
        </Button>
      }
    />
  ),

  SearchResults: ({ searchTerm }: { searchTerm: string }) => (
    <EmptyState
      icon={Search}
      title={`Geen resultaten voor "${searchTerm}"`}
      description="Probeer andere zoektermen of pas je filters aan om meer resultaten te vinden."
      action={
        <div className="flex gap-3">
          <Button variant="outline">Filters Wissen</Button>
          <Button variant="business">Nieuwe Zoekopdracht</Button>
        </div>
      }
    />
  ),

  Documents: () => (
    <EmptyState
      icon={FileText}
      title="Nog geen documenten"
      description="Upload documenten om ze te organiseren en te delen met je team."
      action={
        <Button variant="business">
          <Upload className="h-4 w-4" />
          Documenten Uploaden
        </Button>
      }
    />
  ),

  Messages: () => (
    <EmptyState
      icon={Inbox}
      title="Nog geen berichten"
      description="Wanneer je berichten ontvangt of verstuurt, zie je ze hier."
      action={
        <Button variant="business">
          Nieuw Bericht
        </Button>
      }
    />
  ),

  Settings: () => (
    <EmptyState
      icon={Settings}
      title="Configuratie vereist"
      description="Configureer je instellingen om alle functies van het platform te gebruiken."
      action={
        <Button variant="business">
          Instellingen Configureren
        </Button>
      }
    />
  )
}

export { EmptyState, EmptyStates }