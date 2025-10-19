import { Message } from "@/model/user.model";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DashboardPage = () => {

  const [message, setMessage] = useState<Message[]>([]);
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);

  const handleDeleteMessage = (messageId: string) =>
  {
    setMessage(message.filter((message) => message._id !== messageId))
  }

  const {data: session} = useSession()

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema)
  })

  const {register, watch, setValue} = form;

  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessage= useCallback(async() => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-message')
      setValue('acceptMessages', response.data.isAcceptingMessages ?? false)
      
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Something went wrong. Please try again.")
      
    }

  },[setValue])

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardPage;
