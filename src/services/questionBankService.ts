import api from '@/lib/api';

export type QuestionType = 'multiple_choice' | 'checkbox' | 'identification';

export interface QuestionOption {
  id?: number;
  text: string;
  is_correct: boolean;
  order: number;
}

export interface Question {
  id: number;
  course_id: number;
  question_text: string;
  question_type: QuestionType;
  points: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  order: number;
  options?: QuestionOption[];
  correct_answer?: string; // For identification questions
  created_at: string;
  updated_at: string;
  created_by?: {
    id: number;
    f_name: string;
    l_name: string;
  };
}

export interface CreateQuestionData {
  course_id: number;
  question_text: string;
  question_type: QuestionType;
  points: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: Omit<QuestionOption, 'id'>[];
  correct_answer?: string;
  order?: number;
}

export interface UpdateQuestionData {
  question_text?: string;
  points?: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  is_active?: boolean;
  options?: Omit<QuestionOption, 'id'>[];
  correct_answer?: string;
  order?: number;
}

export interface QuestionBankResponse {
  success: boolean;
  data: Question[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

// Get all questions for a course
export const getQuestionsByCourse = async (
  courseId: number,
  page: number = 1,
  perPage: number = 20,
  search?: string,
  type?: QuestionType,
  difficulty?: string
): Promise<QuestionBankResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (difficulty) params.append('difficulty', difficulty);
    
    const response = await api.get(`/api/admin/courses/${courseId}/questions?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Get a single question
export const getQuestion = async (id: number): Promise<{ success: boolean; data: Question }> => {
  try {
    const response = await api.get(`/api/admin/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

// Create a new question
export const createQuestion = async (data: CreateQuestionData): Promise<{ 
  success: boolean; 
  message: string; 
  data: Question 
}> => {
  try {
    const response = await api.post('/api/admin/questions', data);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// Update a question
export const updateQuestion = async (
  id: number, 
  data: UpdateQuestionData
): Promise<{ success: boolean; message: string; data: Question }> => {
  try {
    const response = await api.put(`/api/admin/questions/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete a question
export const deleteQuestion = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/admin/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Update question order
export const updateQuestionOrder = async (updates: { id: number; order: number }[]): Promise<{ 
  success: boolean; 
  message: string 
}> => {
  try {
    const response = await api.put('/api/admin/questions/update-order', { updates });
    return response.data;
  } catch (error) {
    console.error('Error updating question order:', error);
    throw error;
  }
};

// Get next order number for a course
export const getNextOrderForCourse = async (courseId: number): Promise<{ nextOrder: number }> => {
  try {
    const response = await api.get(`/api/admin/courses/${courseId}/questions/next-order`);
    return response.data;
  } catch (error) {
    console.error('Error getting next order:', error);
    throw error;
  }
};

// Duplicate a question
export const duplicateQuestion = async (id: number): Promise<{ 
  success: boolean; 
  message: string; 
  data: Question 
}> => {
  try {
    const response = await api.post(`/api/admin/questions/${id}/duplicate`);
    return response.data;
  } catch (error) {
    console.error('Error duplicating question:', error);
    throw error;
  }
};

// Bulk operations
export const bulkUpdateQuestions = async (
  questionIds: number[],
  updates: Partial<UpdateQuestionData>
): Promise<{ success: boolean; message: string; updated_count: number }> => {
  try {
    const response = await api.put('/api/admin/questions/bulk-update', {
      question_ids: questionIds,
      updates
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating questions:', error);
    throw error;
  }
};

export const bulkDeleteQuestions = async (questionIds: number[]): Promise<{ 
  success: boolean; 
  message: string; 
  deleted_count: number 
}> => {
  try {
    const response = await api.delete('/api/admin/questions/bulk-delete', {
      data: { question_ids: questionIds }
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting questions:', error);
    throw error;
  }
};

// Utility functions
export const validateQuestion = (question: Partial<CreateQuestionData>): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (!question.question_text?.trim()) {
    errors.push('Question text is required');
  }
  
  if (!question.question_type) {
    errors.push('Question type is required');
  }
  
  if (!question.points || question.points < 0) {
    errors.push('Points must be a positive number');
  }
  
  if (question.question_type === 'multiple_choice' || question.question_type === 'checkbox') {
    if (!question.options || question.options.length < 2) {
      errors.push('At least 2 options are required for this question type');
    }
    
    if (question.options) {
      const correctOptions = question.options.filter(opt => opt.is_correct);
      
      if (question.question_type === 'multiple_choice' && correctOptions.length !== 1) {
        errors.push('Multiple choice questions must have exactly one correct answer');
      }
      
      if (question.question_type === 'checkbox' && correctOptions.length === 0) {
        errors.push('Checkbox questions must have at least one correct answer');
      }
    }
  }
  
  if (question.question_type === 'identification' && !question.correct_answer?.trim()) {
    errors.push('Correct answer is required for identification questions');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getQuestionTypeLabel = (type: QuestionType): string => {
  switch (type) {
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'checkbox':
      return 'Checkbox';
    case 'identification':
      return 'Identification';
    default:
      return type;
  }
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};