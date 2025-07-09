import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'prep' | 'shoot' | 'post' | 'wrap';
  start_date: string;
  end_date: string;
  budget: number;
  location_primary: string;
  director?: string;
  producer?: string;
  cinematographer?: string;
  created_at?: string;
}

interface ProjectContextType {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  refetchProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Hook s optional fallback
export const useProject = (required: boolean = true) => {
  const context = useContext(ProjectContext);
  if (required && context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context || { project: null, isLoading: false, error: null, refetchProject: () => {} };
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const url = `${apiUrl}/api/v1/production/productions/${projectId}/`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project');
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const refetchProject = () => {
    fetchProject();
  };

  return (
    <ProjectContext.Provider value={{ project, isLoading, error, refetchProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
