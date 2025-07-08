import { useState, useCallback, useMemo } from 'react';

interface Document {
  id: string;
  title: string;
  filename: string;
  type: 'script' | 'contract' | 'callsheet' | 'storyboard' | 'concept' | 'legal' | 'schedule' | 'other';
  category: 'pre_production' | 'production' | 'post_production' | 'admin' | 'legal';
  status: 'draft' | 'review' | 'approved' | 'final' | 'archived';
  version: string;
  size: number;
  uploadedAt: string;
  lastModified: string;
  tags: string[];
  comments: DocumentComment[];
  versions: DocumentVersion[];
}

interface DocumentComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'suggestion' | 'approval' | 'rejection';
}

interface DocumentVersion {
  id: string;
  version: string;
  uploadedAt: string;
  changeLog: string;
  status: 'draft' | 'review' | 'approved' | 'final';
}

export function useDocumentManager(projectId: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Document analytics
  const analytics = useMemo(() => {
    const totalDocs = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    
    const byStatus = {
      draft: documents.filter(d => d.status === 'draft').length,
      review: documents.filter(d => d.status === 'review').length,
      approved: documents.filter(d => d.status === 'approved').length,
      final: documents.filter(d => d.status === 'final').length,
      archived: documents.filter(d => d.status === 'archived').length
    };

    const byType = {
      script: documents.filter(d => d.type === 'script').length,
      contract: documents.filter(d => d.type === 'contract').length,
      callsheet: documents.filter(d => d.type === 'callsheet').length,
      storyboard: documents.filter(d => d.type === 'storyboard').length,
      concept: documents.filter(d => d.type === 'concept').length,
      legal: documents.filter(d => d.type === 'legal').length,
      schedule: documents.filter(d => d.type === 'schedule').length,
      other: documents.filter(d => d.type === 'other').length
    };

    const pendingApprovals = documents.filter(d => d.status === 'review').length;

    const recentlyModified = documents.filter(d => {
      const modifiedDate = new Date(d.lastModified);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return modifiedDate > weekAgo;
    }).length;

    return {
      totalDocs,
      totalSize,
      byStatus,
      byType,
      pendingApprovals,
      recentlyModified
    };
  }, [documents]);

  const uploadDocument = useCallback(async (file: File, metadata: any) => {
    setIsLoading(true);
    try {
      const newDocument: Document = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        comments: [],
        versions: [{
          id: `v1`,
          version: '1.0',
          uploadedAt: new Date().toISOString(),
          changeLog: 'Initial version',
          status: 'draft'
        }],
        ...metadata
      };
      
      setDocuments(prev => [newDocument, ...prev]);
      console.log('Document uploaded:', newDocument);
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDocument = useCallback(async (documentId: string, updates: Partial<Document>) => {
    setIsLoading(true);
    try {
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, ...updates, lastModified: new Date().toISOString() }
          : doc
      ));
      
      console.log('Document updated:', documentId, updates);
    } catch (error) {
      console.error('Failed to update document:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    try {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      console.log('Document deleted:', documentId);
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addComment = useCallback(async (documentId: string, comment: Omit<DocumentComment, 'id' | 'timestamp'>) => {
    setIsLoading(true);
    try {
      const newComment: DocumentComment = {
        ...comment,
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              comments: [...doc.comments, newComment],
              lastModified: new Date().toISOString()
            }
          : doc
      ));
      
      console.log('Comment added:', documentId, newComment);
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadVersion = useCallback(async (documentId: string, file: File, changeLog: string) => {
    setIsLoading(true);
    try {
      const currentDoc = documents.find(d => d.id === documentId);
      if (!currentDoc) throw new Error('Document not found');
      
      const currentVersion = currentDoc.version;
      const versionParts = currentVersion.split('.');
      const newMinorVersion = parseInt(versionParts[1] || '0') + 1;
      const newVersion = `${versionParts[0]}.${newMinorVersion}`;
      
      const newDocVersion: DocumentVersion = {
        id: `v${newVersion}`,
        version: newVersion,
        uploadedAt: new Date().toISOString(),
        changeLog,
        status: 'draft'
      };
      
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              version: newVersion,
              filename: file.name,
              size: file.size,
              lastModified: new Date().toISOString(),
              versions: [...doc.versions, newDocVersion]
            }
          : doc
      ));
      
      console.log('Version uploaded:', documentId, newDocVersion);
    } catch (error) {
      console.error('Failed to upload version:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  return {
    documents,
    setDocuments,
    analytics,
    isLoading,
    uploadDocument,
    updateDocument,
    deleteDocument,
    addComment,
    uploadVersion
  };
}
