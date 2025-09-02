import { toast as sonnerToast } from "sonner"
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"

// Nederlandse Business Toast Utilities
export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4" />,
      classNames: {
        toast: "group-[.toaster]:bg-white group-[.toaster]:border-success-200 group-[.toaster]:text-neutral-900",
        title: "group-[.toast]:text-success-800 group-[.toast]:font-medium",
        description: "group-[.toast]:text-neutral-600",
        icon: "group-[.toast]:text-success-600"
      }
    })
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4" />,
      classNames: {
        toast: "group-[.toaster]:bg-white group-[.toaster]:border-error-200 group-[.toaster]:text-neutral-900",
        title: "group-[.toast]:text-error-800 group-[.toast]:font-medium",
        description: "group-[.toast]:text-neutral-600",
        icon: "group-[.toast]:text-error-600"
      }
    })
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      icon: <AlertCircle className="h-4 w-4" />,
      classNames: {
        toast: "group-[.toaster]:bg-white group-[.toaster]:border-warning-200 group-[.toaster]:text-neutral-900",
        title: "group-[.toast]:text-warning-800 group-[.toast]:font-medium", 
        description: "group-[.toast]:text-neutral-600",
        icon: "group-[.toast]:text-warning-600"
      }
    })
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      icon: <Info className="h-4 w-4" />,
      classNames: {
        toast: "group-[.toaster]:bg-white group-[.toaster]:border-primary-200 group-[.toaster]:text-neutral-900",
        title: "group-[.toast]:text-primary-800 group-[.toast]:font-medium",
        description: "group-[.toast]:text-neutral-600", 
        icon: "group-[.toast]:text-primary-600"
      }
    })
  },

  // Nederlandse Business Messages
  propertyCreated: () => toast.success("Pand succesvol aangemaakt", "Het nieuwe pand is toegevoegd aan je portfolio"),
  propertyUpdated: () => toast.success("Pand bijgewerkt", "De wijzigingen zijn succesvol opgeslagen"),
  propertyDeleted: () => toast.success("Pand verwijderd", "Het pand is permanent verwijderd uit het systeem"),
  
  contactCreated: () => toast.success("Contact toegevoegd", "Het nieuwe contact is toegevoegd aan je CRM"),
  contactUpdated: () => toast.success("Contact bijgewerkt", "De contactgegevens zijn succesvol opgeslagen"),
  contactDeleted: () => toast.success("Contact verwijderd", "Het contact is permanent verwijderd"),

  formSaved: () => toast.success("Wijzigingen opgeslagen", "Alle gegevens zijn automatisch opgeslagen"),
  formError: () => toast.error("Opslaan mislukt", "Controleer je gegevens en probeer opnieuw"),
  
  loginSuccess: () => toast.success("Succesvol ingelogd", "Welkom terug in je dashboard"),
  loginError: () => toast.error("Inloggen mislukt", "Controleer je email en wachtwoord"),
  
  uploadSuccess: (fileName: string) => toast.success("Bestand geüpload", `${fileName} is succesvol toegevoegd`),
  uploadError: () => toast.error("Upload mislukt", "Probeer het bestand opnieuw te uploaden"),

  permissionDenied: () => toast.error("Geen toegang", "Je hebt geen rechten voor deze actie"),
  networkError: () => toast.error("Verbindingsfout", "Controleer je internetverbinding en probeer opnieuw")
}

// Hook for Nederlandse business feedback
export function useBusinessToast() {
  return toast
}