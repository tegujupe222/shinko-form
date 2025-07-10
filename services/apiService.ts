import type { Form, Submission, Checkin } from '../types';

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

// Email API
export const emailApi = {
  async sendNotification(emailData: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    return response.json();
  },
};

// PDF API
export const pdfApi = {
  async generateReceipt(pdfData: {
    formData: Form;
    submissionData: Submission;
    qrCodeData?: any;
  }): Promise<{ success: boolean; pdfData: string; filename: string }> {
    const response = await fetch(`${API_BASE_URL}/generatePDF`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfData),
    });
    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }
    return response.json();
  },
};

// Checkin API
export const checkinApi = {
  async getAll(params?: { formId?: string; date?: string }): Promise<Checkin[]> {
    const queryParams = new URLSearchParams();
    if (params?.formId) queryParams.append('formId', params.formId);
    if (params?.date) queryParams.append('date', params.date);
    
    const response = await fetch(`${API_BASE_URL}/checkin?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch checkins');
    }
    return response.json();
  },

  async create(checkinData: Omit<Checkin, 'id' | 'createdAt'>): Promise<Checkin> {
    const response = await fetch(`${API_BASE_URL}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkinData),
    });
    if (!response.ok) {
      throw new Error('Failed to create checkin');
    }
    return response.json();
  },

  async update(id: string, checkinData: Partial<Checkin>): Promise<Checkin> {
    const response = await fetch(`${API_BASE_URL}/checkin?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkinData),
    });
    if (!response.ok) {
      throw new Error('Failed to update checkin');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/checkin?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete checkin');
    }
  },
}; 