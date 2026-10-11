import { apiRequest } from './api';

// Mind Map Folder API
export const mindMapFolderAPI = {
  // Get all folders
  getFolders: async () => {
    return apiRequest<any[]>('/mindmaps/folders', {
      method: 'GET',
    });
  },

  // Get single folder
  getFolder: async (id: string) => {
    return apiRequest<any>(`/mindmaps/folders/${id}`, {
      method: 'GET',
    });
  },

  // Create folder
  createFolder: async (data: { name: string; description?: string; color?: string }) => {
    return apiRequest<any>('/mindmaps/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update folder
  updateFolder: async (id: string, data: { name: string; description?: string; color?: string }) => {
    return apiRequest<any>(`/mindmaps/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete folder
  deleteFolder: async (id: string) => {
    return apiRequest<any>(`/mindmaps/folders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Mind Map API
export const mindMapAPI = {
  // Get all mind maps (with optional filters)
  getMindMaps: async (params?: { folderId?: string | null; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.folderId !== undefined) {
      queryParams.append('folderId', params.folderId || 'null');
    }
    if (params?.type) {
      queryParams.append('type', params.type);
    }
    const query = queryParams.toString();
    return apiRequest<any[]>(`/mindmaps${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single mind map
  getMindMap: async (id: string) => {
    return apiRequest<any>(`/mindmaps/${id}`, {
      method: 'GET',
    });
  },

  // Create mind map
  createMindMap: async (data: {
    title: string;
    description?: string;
    type?: string;
    folderId?: string | null;
    nodes?: any[];
    edges?: any[];
    metadata?: any;
  }) => {
    return apiRequest<any>('/mindmaps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update mind map
  updateMindMap: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      type?: string;
      folderId?: string | null;
      nodes?: any[];
      edges?: any[];
      metadata?: any;
    }
  ) => {
    return apiRequest<any>(`/mindmaps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Move mind map to folder
  moveMindMap: async (id: string, folderId: string | null) => {
    return apiRequest<any>(`/mindmaps/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ folderId }),
    });
  },

  // Delete mind map
  deleteMindMap: async (id: string) => {
    return apiRequest<any>(`/mindmaps/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk delete mind maps
  bulkDelete: async (ids: string[]) => {
    return apiRequest<any>('/mindmaps/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  // Bulk move mind maps
  bulkMove: async (ids: string[], folderId: string | null) => {
    return apiRequest<any>('/mindmaps/bulk-move', {
      method: 'POST',
      body: JSON.stringify({ ids, folderId }),
    });
  },

  // Generate mind map with AI
  generateWithAI: async (data: {
    topic: string;
    description?: string;
    type?: string;
    context?: string;
  }) => {
    return apiRequest<any>('/mindmaps/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Generate mind map from skill
  generateFromSkill: async (skillId: string) => {
    return apiRequest<any>(`/mindmaps/generate/skill/${skillId}`, {
      method: 'POST',
    });
  },
};
