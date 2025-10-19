
'use client'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { signInSchema } from "@/schemas/signinSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const page = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter();

  //zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
     const result = await signIn('credentials',{
      redirect: false,
      identifier:data.identifier,
      password: data.password
     })
     if (result?.error) {
      toast.error('Error during sign in')
     }
    if( result?.url){
      router.replace('/dashboard')
    }
  }

  return (
    <div>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Anonymous Feedback Sender
        </h1>
        <p className="mb-4">Sign in to use and send anynomous feedback</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {
            isSubmitting ? (
              <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
              </>
            ) : (
              "Sign In"
            )
          }
          
        </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            New account account?{" "}
            <Link href="/sign-up" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        </div>
        </div>
    </div>
  )
}

export default page;