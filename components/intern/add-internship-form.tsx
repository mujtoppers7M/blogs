"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useAddInternship } from "@/hooks/internship"

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  mode: z.enum(["remote", "hybrid", "on-site"], {
    required_error: "Please select a work mode.",
  }),
  stipendMin: z.string().min(1, {
    message: "Minimum stipend is required.",
  }),
  stipendMax: z.string().min(1, {
    message: "Maximum stipend is required.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
})

export function AddInternshipForm() {
  const addInternshipMutation = useAddInternship();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      stipendMin: "",
      stipendMax: "",
      url: "",
    },
  })
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    const data = {
      ...values,
      stipendMin: parseFloat(values.stipendMin),
      stipendMax: parseFloat(values.stipendMax),
    };
    
    addInternshipMutation.mutate(data, {
      onSuccess: () => {
        console.log('Internship added successfully:', data);
        form.reset();
      },
      onError: (error) => {
        console.error('Failed to add internship:', error);
      },
    });
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Google, Microsoft, etc." {...field} className="text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Work Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="on-site">On-site</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="stipendMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Minimum Stipend (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10000" {...field} className="text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stipendMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Maximum Stipend (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50000" {...field} className="text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Internship URL</FormLabel>
              <FormControl>
                <Input placeholder="https://company.com/careers/internship" {...field} className="text-sm" />
              </FormControl>
              <FormDescription className="text-xs">Link to the company's internship application page</FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full sm:w-auto"
          disabled={addInternshipMutation.isLoading}
        >
          {addInternshipMutation.isLoading ? "Adding..." : "Add Internship"}
        </Button>
      </form>
    </Form>
  )
}