// components/tv-mode-settings.tsx

"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Clock, TextCursorInput, Monitor, Users, Upload, Trash, Plus, Image as ImageIcon, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from '@/lib/supabase/client'


const STORAGE_BUCKET = 'tv_backgrounds';

interface BackgroundFile {
    name: string;
    id: string;
    url: string;
}

export function TvModeSettings({ userId }: { userId: string }) {
    const supabase = createClient();
    const [fileToUpload, setFileToUpload] = React.useState<File | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [backgrounds, setBackgrounds] = React.useState<BackgroundFile[]>([]);
    const [isLoadingBackgrounds, setIsLoadingBackgrounds] = React.useState(true);


    const fetchBackgrounds = React.useCallback(async () => {
        setIsLoadingBackgrounds(true);
        // List files under the user's folder
        const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(userId, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        });

        if (error) {
            console.error("Supabase Storage Error on list:", error.message);
            toast.error("Failed to fetch backgrounds: Check Storage RLS policies.");
            setIsLoadingBackgrounds(false);
            return;
        }

        // Transform the file list into a list with public URLs
        const publicUrls = data.map(file => {
            const { data: publicURLData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(`${userId}/${file.name}`);

            return {
                name: file.name,
                id: file.id || file.name,
                url: publicURLData.publicUrl,
            } as BackgroundFile;
        }).filter(f => f.name !== '.emptyFolderPlaceholder');

        setBackgrounds(publicUrls);
        setIsLoadingBackgrounds(false);
    }, [supabase, userId]);

    React.useEffect(() => {
        fetchBackgrounds();
    }, [fetchBackgrounds]);

    const handleFileUpload = async () => {
        if (!fileToUpload) return;
        setIsUploading(true);

        const safeFileName = fileToUpload.name.replace(/\s/g, '_');
        const filePath = `${userId}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, fileToUpload, {
                cacheControl: '3600',
                upsert: false
            });

        setIsUploading(false);

        if (uploadError) {
            console.error("Supabase Storage Error on upload:", uploadError.message);
            toast.error("Upload failed: Check Storage RLS policies. Error: " + uploadError.message);
        } else {
            toast.success("Background uploaded successfully!");
            setFileToUpload(null);
            await fetchBackgrounds();
        }
    }

    const handleDeleteBackground = async (fileName: string) => {
        if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;

        const filePath = `${userId}/${fileName}`;
        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (error) {
            toast.error("Deletion failed: " + error.message);
        } else {
            toast.success("Background deleted!");
            await fetchBackgrounds();
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            setFileToUpload(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };


    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Monitor className="h-5 w-5" /> Detailed TV Mode Settings
            </h2>
            <Card>
                <CardContent className="p-0">
                    <Tabs defaultValue="schedule" className="space-y-4 p-6">
                        <TabsList>
                            <TabsTrigger value="schedule" className="flex items-center gap-1">
                                <Clock className="h-4 w-4" /> Schedule & Classes
                            </TabsTrigger>
                            <TabsTrigger value="clo" className="flex items-center gap-1">
                                <TextCursorInput className="h-4 w-4" /> CLO/Text
                            </TabsTrigger>
                            <TabsTrigger value="backgrounds" className="flex items-center gap-1">
                                <Upload className="h-4 w-4" /> Backgrounds
                            </TabsTrigger>
                            <TabsTrigger value="line" className="flex items-center gap-1">
                                <Users className="h-4 w-4" /> Line Management
                            </TabsTrigger>
                        </TabsList>

                        {/* --- SCHEDULE TAB --- */}
                        <TabsContent value="schedule" className="space-y-4 pt-2">
                            <Card>
                                <CardHeader><CardTitle>Class and Schedule Editor</CardTitle></CardHeader>
                                <CardContent className="py-6 text-muted-foreground">Schedule logic goes here (Class Hours, Repeating/Override Schedule).</CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- CLO/TEXT TAB --- */}
                        <TabsContent value="clo" className="space-y-4 pt-2">
                            <Card>
                                <CardHeader><CardTitle>CLO Management</CardTitle></CardHeader>
                                <CardContent className="py-6 text-muted-foreground">CLO editing and assignment logic goes here (Real-time CLO, Out-of-Class CLO).</CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- Backgrounds Tab (Upload/Delete/Preview) --- */}
                        <TabsContent value="backgrounds" className="space-y-4 pt-2">
                            <Card>
                                <CardHeader><CardTitle>Upload New Background</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Drag and Drop Area */}
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onClick={() => document.getElementById('file-input-bg')?.click()}
                                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors"
                                    >
                                        {fileToUpload ? (
                                            <div className="flex items-center text-sm font-medium text-green-600">
                                                <CheckCircle className="mr-2 h-5 w-5" />
                                                {fileToUpload.name} ready to upload.
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-muted-foreground">
                                                <Upload className="h-8 w-8 mb-2" />
                                                <p className="font-medium">Drag and drop an image here, or click to select.</p>
                                                <p className="text-xs">JPG, PNG, GIF files.</p>
                                            </div>
                                        )}
                                        <Input
                                            id="file-input-bg"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                                            className="hidden"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleFileUpload}
                                        disabled={!fileToUpload || isUploading}
                                        className="w-full"
                                    >
                                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        {isUploading ? 'Uploading...' : 'Upload Image'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Existing Backgrounds ({backgrounds.length})</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {isLoadingBackgrounds ? (
                                            <div className="col-span-full flex justify-center py-4">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                        ) : backgrounds.length === 0 ? (
                                            <p className="col-span-full text-muted-foreground">No custom backgrounds uploaded yet.</p>
                                        ) : (
                                            backgrounds.map((bg) => (
                                                <div
                                                    key={bg.id}
                                                    className="group relative aspect-video overflow-hidden rounded-lg shadow-md border"
                                                >
                                                    <img
                                                        src={bg.url}
                                                        alt={`TV Background: ${bg.name}`}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />

                                                    {/* AI-style overlay/actions */}
                                                    <div className="absolute inset-0 bg-black/30 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="text-white text-xs truncate max-w-[70%]">{bg.name}</div>
                                                        <div className="ml-auto flex gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-white hover:bg-white/20"
                                                                onClick={() => console.log('Set as single background: ', bg.name)}
                                                            >
                                                                <ImageIcon className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-red-400 hover:bg-red-500/20"
                                                                onClick={() => handleDeleteBackground(bg.name)}
                                                            >
                                                                <Trash className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4">
                                        <Button variant="secondary" className="flex-1">Set Random Background Mode</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- LINE MANAGEMENT TAB --- */}
                        <TabsContent value="line" className="space-y-4 pt-2">
                            <Card>
                                <CardHeader><CardTitle>Real-time Pass Line Management</CardTitle></CardHeader>
                                <CardContent className="py-6 text-muted-foreground">Line queue management logic goes here (Add, Remove, View Queue).</CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}