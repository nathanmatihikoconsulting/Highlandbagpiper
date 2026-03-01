import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface FileUploadProps {
  bagpiperId: Id<"bagpipers">;
}

export function FileUpload({ bagpiperId }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    fileType: "audio" as "audio" | "certificate" | "document" | "image",
    description: "",
    isPublic: true,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const uploadFile = useMutation(api.files.uploadFile);
  const deleteFile = useMutation(api.files.deleteFile);
  const updateFileVisibility = useMutation(api.files.updateFileVisibility);
  const files = useQuery(api.files.getBagpiperFiles, { bagpiperId });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Generate upload URL
      const postUrl = await generateUploadUrl();
      
      // Upload file to Convex storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      const json = await result.json();
      if (!result.ok) {
        throw new Error(`Upload failed: ${JSON.stringify(json)}`);
      }
      
      const { storageId } = json;
      
      // Save file metadata to database
      await uploadFile({
        bagpiperId,
        fileId: storageId,
        fileName: file.name,
        fileType: uploadForm.fileType,
        description: uploadForm.description || undefined,
        isPublic: uploadForm.isPublic,
      });
      
      toast.success("File uploaded successfully!");
      
      // Reset form
      setUploadForm({
        fileType: "audio",
        description: "",
        isPublic: true,
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (error) {
      toast.error("Failed to upload file");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: Id<"bagpiperFiles">) => {
    try {
      await deleteFile({ fileId });
      toast.success("File deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete file");
      console.error(error);
    }
  };

  const handleToggleVisibility = async (fileId: Id<"bagpiperFiles">, isPublic: boolean) => {
    try {
      await updateFileVisibility({ fileId, isPublic });
      toast.success(`File ${isPublic ? "made public" : "made private"}!`);
    } catch (error) {
      toast.error("Failed to update file visibility");
      console.error(error);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "audio": return "🎵";
      case "certificate": return "🏆";
      case "document": return "📄";
      case "image": return "🖼️";
      default: return "📁";
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case "audio": return "bg-purple-100 text-purple-700";
      case "certificate": return "bg-yellow-100 text-yellow-700";
      case "document": return "bg-blue-100 text-blue-700";
      case "image": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Type
            </label>
            <select
              value={uploadForm.fileType}
              onChange={(e) => setUploadForm({ 
                ...uploadForm, 
                fileType: e.target.value as any 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="audio">Audio Sample</option>
              <option value="certificate">Certificate</option>
              <option value="document">Document</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ 
                ...uploadForm, 
                description: e.target.value 
              })}
              placeholder="Optional description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={uploadForm.isPublic}
                onChange={(e) => setUploadForm({ 
                  ...uploadForm, 
                  isPublic: e.target.checked 
                })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Public (visible to customers)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {isUploading && (
            <div className="flex items-center px-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Files List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
        
        {files === undefined ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No files uploaded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{file.fileName}</h4>
                      {file.description && (
                        <p className="text-sm text-gray-600">{file.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.fileType)}`}>
                          {file.fileType}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          file.isPublic 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {file.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        View
                      </a>
                    )}
                    <button
                      onClick={() => handleToggleVisibility(file._id, !file.isPublic)}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      {file.isPublic ? "Make Private" : "Make Public"}
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file._id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
