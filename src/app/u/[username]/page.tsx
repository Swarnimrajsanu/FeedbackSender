
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { MessageSchema } from '@/schemas/messageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Special character to split AI suggested messages (if needed)
const specialChar = '||';
const parseStringMessages = (msgString: string): string[] =>
  msgString.split(specialChar);

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const router = useRouter();

  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // React Hook Form setup
  const form = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
  });

  const { register, watch, setValue } = form;
  const messageContent = watch('content');

  const handleMessageClick = (message: string) => {
    setValue('content', message);
  };

  // Submit anonymous message
  const onSubmit = async (data: z.infer<typeof MessageSchema>) => {
    setIsSending(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });
      toast.success(response.data.message);
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || 'Failed to send message'
      );
    } finally {
      setIsSending(false);
    }
  };

  // Fetch suggested messages
  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/suggest-messages');
      const messages =
        typeof response.data.messages === 'string'
          ? parseStringMessages(response.data.messages)
          : response.data.messages || [];
         setSuggestedMessages(messages);
    } catch (error) {
      toast.error('Failed to fetch suggested messages');
    } finally {
      setIsSuggestLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>

      {/* Form to send message */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            <Button type="submit" disabled={isSending || !messageContent}>
              {isSending ? 'Sending...' : 'Send It'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Suggested messages */}
      <div className="space-y-4 my-8">
        <Button
          onClick={fetchSuggestedMessages}
          disabled={isSuggestLoading}
          className="my-4"
        >
          {isSuggestLoading ? 'Loading...' : 'Suggest Messages'}
        </Button>
        <p>Click on any message below to select it.</p>

        {suggestedMessages.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Suggested Messages</h3>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              {suggestedMessages.map((msg, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => handleMessageClick(msg)}
                >
                  {msg}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="my-6" />

      <div className="text-center">
        <p className="mb-4">Get Your Message Board</p>
        <Button onClick={() => router.push('/sign-up')}>Create Your Account</Button>
      </div>
    </div>
  );
}
