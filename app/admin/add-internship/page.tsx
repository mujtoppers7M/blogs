import { AddInternshipForm } from "@/components/intern/add-internship-form"

export default function AddInternshipPage() {
  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Internship</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">Add a new internship opportunity for MUJ students.</p>
      </div>
      <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6 w-full">
        <AddInternshipForm />
      </div>
    </div>
  )
}
