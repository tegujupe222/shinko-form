import type { Form, Submission } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-app.vercel.app/api' 
  : 'http://localhost:3000/api';

// Forms API
export const formsApi = {
  async getAll(): Promise<Form[]> {
    const response = await fetch(`${API_BASE_URL}/forms`);
    if (!response.ok) {
      throw new Error('Failed to fetch forms');
    }
    return response.json();
  },

  async getById(id: string): Promise<Form | null> {
    const response = await fetch(`${API_BASE_URL}/forms?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch form');
    }
    return response.json();
  },

  async create(formData: Omit<Form, 'id'>): Promise<Form> {
    const response = await fetch(`${API_BASE_URL}/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error('Failed to create form');
    }
    return response.json();
  },

  async update(id: string, formData: Partial<Form>): Promise<Form> {
    const response = await fetch(`${API_BASE_URL}/forms?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error('Failed to update form');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/forms?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete form');
    }
  },
};

// Submissions API
export const submissionsApi = {
  async getAll(): Promise<Submission[]> {
    const response = await fetch(`${API_BASE_URL}/submissions`);
    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }
    return response.json();
  },

  async getByFormId(formId: string): Promise<Submission[]> {
    const response = await fetch(`${API_BASE_URL}/submissions?formId=${formId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }
    return response.json();
  },

  async create(submissionData: Omit<Submission, 'id' | 'submittedAt'>): Promise<Submission> {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });
    if (!response.ok) {
      throw new Error('Failed to create submission');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/submissions?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete submission');
    }
  },
}; 