// API route for submissions CRUD operations
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
        // Get all submissions or submissions for specific form
        const { formId } = req.query;
        if (formId) {
          // Get submissions for specific form
          const formSubmissions = await getSubmissionsByFormId(formId);
          res.status(200).json(formSubmissions);
        } else {
          // Get all submissions
          const submissions = await getAllSubmissions();
          res.status(200).json(submissions);
        }
        break;

      case 'POST':
        // Create new submission
        const newSubmission = await createSubmission(req.body);
        res.status(201).json(newSubmission);
        break;

      case 'DELETE':
        // Delete submission
        await deleteSubmission(req.query.id);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Mock database functions (replace with actual database)
let submissions = [];

async function getAllSubmissions() {
  return submissions;
}

async function getSubmissionsByFormId(formId) {
  return submissions.filter(sub => sub.formId === formId);
}

async function createSubmission(submissionData) {
  const newSubmission = {
    id: `sub-${Date.now()}`,
    ...submissionData,
    submittedAt: new Date().toISOString()
  };
  submissions.push(newSubmission);
  return newSubmission;
}

async function deleteSubmission(id) {
  const index = submissions.findIndex(sub => sub.id === id);
  if (index === -1) {
    throw new Error('Submission not found');
  }
  
  submissions.splice(index, 1);
} 