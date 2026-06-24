'use client'

import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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

const ArchiveButton = () => {
    const archiveProject = api.project.archiveProject.useMutation();
    const { projectId } = useProject();
    const refetch = useRefetch();

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    disabled={archiveProject.isPending} 
                    size='sm' 
                    variant='destructive'
                >
                    {archiveProject.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Archiving...
                        </>
                    ) : (
                        "Archive"
                    )}
                </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Archive this project?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will move the project to the "Archived" tab. You can restore it later if you need to, but it will be hidden from your main dashboard.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                            archiveProject.mutate(
                                { projectId },
                                {
                                    onSuccess: () => {
                                        toast.success("Project archived");
                                        refetch();
                                    },
                                    onError: () => {
                                        toast.error("Failed to archive project");
                                    },
                                },
                            );
                        }}
                    >
                        Archive Project
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ArchiveButton;