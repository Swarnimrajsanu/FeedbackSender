'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { MessageCard } from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { Message, User } from "@/model/user.model"
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"

const DashboardPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
    defaultValues: {
      acceptMessages: false,
    },
  })

  const { register, watch, setValue } = form
  const acceptMessages = watch("acceptMessages")

  // ✅ Fetch current "accept messages" status
  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages")
      setValue("acceptMessages", response.data.isAcceptingMessages ?? false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || "Failed to fetch settings.")
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  // ✅ Fetch all messages
  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    try {
      const response = await axios.get<ApiResponse>("/api/get-messages")
      setMessages(response.data.messages || [])

      if (refresh) toast.success("Messages refreshed!")
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || "Failed to fetch messages.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ✅ On mount, fetch user data if logged in
  useEffect(() => {
    if (!session?.user) return
    fetchMessages()
    fetchAcceptMessage()
  }, [session, fetchAcceptMessage, fetchMessages])

  // ✅ Handle switch toggle
  const handleSwitchChange = async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      })
      setValue("acceptMessages", !acceptMessages)
      toast.success(
        response.data.message || `Messages turned ${!acceptMessages ? "on" : "off"}`
      )
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || "Failed to update setting.")
    } finally {
      setIsSwitchLoading(false)
    }
  }

  // ✅ Handle message delete
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId))
  }

  if (!session?.user) {
    return <div className="flex justify-center items-center h-screen text-gray-500">Loading session...</div>
  }

  const { username } = session.user as User

  // ✅ Avoid using `window` directly on SSR
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : ""
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast("URL Copied!", {
      description: "Profile URL has been copied to clipboard.",
    })
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      {/* Copy Link Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Unique Feedback Link</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="border rounded px-3 py-2 w-full text-gray-600"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      {/* Switch Toggle */}
      <div className="flex items-center mb-6">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages:{" "}
          <strong>{acceptMessages ? "Enabled" : "Disabled"}</strong>
        </span>
      </div>

      <Separator />

      {/* Refresh Button */}
      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          onClick={() => fetchMessages(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Refreshing
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </>
          )}
        </Button>
      </div>

      {/* Messages */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <MessageCard
              key={msg._id || msg.id}
              message={msg}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p className="text-gray-600 text-center col-span-2">
            No messages yet.
          </p>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
