// API route for forms CRUD operations
export default async function handler(req, res) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (method) {
      case 'GET':
        // Get all forms or specific form by ID
        const { id } = req.query;
        if (id) {
          // Get specific form
          const form = await getFormById(id);
          res.status(200).json(form);
        } else {
          // Get all forms
          const forms = await getAllForms();
          res.status(200).json(forms);
        }
        break;

      case 'POST':
        // Create new form
        const newForm = await createForm(req.body);
        res.status(201).json(newForm);
        break;

      case 'PUT':
        // Update form
        const updatedForm = await updateForm(req.query.id, req.body);
        res.status(200).json(updatedForm);
        break;

      case 'DELETE':
        // Delete form
        await deleteForm(req.query.id);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Mock database functions (replace with actual database)
let forms = [];
let submissions = [];

async function getAllForms() {
  return forms;
}

async function getFormById(id) {
  return forms.find(form => form.id === id) || null;
}

async function createForm(formData) {
  const newForm = {
    id: `form-${Date.now()}`,
    ...formData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  forms.push(newForm);
  return newForm;
}

async function updateForm(id, formData) {
  const index = forms.findIndex(form => form.id === id);
  if (index === -1) {
    throw new Error('Form not found');
  }
  
  forms[index] = {
    ...forms[index],
    ...formData,
    updatedAt: new Date().toISOString()
  };
  return forms[index];
}

async function deleteForm(id) {
  const index = forms.findIndex(form => form.id === id);
  if (index === -1) {
    throw new Error('Form not found');
  }
  
  forms.splice(index, 1);
  // Also delete related submissions
  submissions = submissions.filter(sub => sub.formId !== id);
} 