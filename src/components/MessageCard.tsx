'use client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Message } from "@/model/user.model";
import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import { X } from "lucide-react";
import { toast } from "sonner";

type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void;
}



const MessageCard = ( {message, onMessageDelete}:MessageCardProps) => {
    const handleDeleteConfirm = async () => {
        const response = await axios.delete<ApiResponse>(`/api/delete-messages/${message._id}`)
        toast.success(response.data.message);;
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
            <X className="w-5 h-5" />
        </Button>

      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
                <CardDescription>Card Description</CardDescription>
        </CardHeader>
</Card>
    )
}


export default MessageCard;