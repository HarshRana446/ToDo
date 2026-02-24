import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const fetchUserByEmail = async (email: string) => {
  try {
    const response = await axiosInstance.get(`/auth/search?email=${email}`);
    return response.data;
  } catch (error) {
    throw new Error("User not found");
  }
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const userData = await fetchUserByEmail(email);
      const receiverId = userData.data?._id || userData._id;

      const response = await axiosInstance.post(
        `/chat/conversation/${receiverId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Conversation created successfully");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create conversation");
    },
  });
};

export const useGetConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await axiosInstance.get("/chat/conversation");
      return response.data;
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: string;
    }) => {
      const response = await axiosInstance.post(`/api/send/${conversationId}`, {
        message,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const conversationId = data.data?.conversationId;
      if (conversationId) {
        queryClient.refetchQueries({
          queryKey: ["messages", conversationId],
          type: "active",
        });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });
};

export const useGetMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/get/${conversationId}`);
      return response.data;
    },
    enabled: !!conversationId,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await axiosInstance.get(
        `/api/unread/${conversationId}`,
      );
      return response.data;
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
