import * as Yup from 'yup';

export const PostFormSchema = (isEdit) =>
  Yup.object().shape({
    title: Yup.string()
      .min(3, 'Title must be at least 3 characters long')
      .max(50, 'Title must be less than 50 characters long')
      .required('Title is required'),
    postContent: Yup.string()
      .min(3, 'Content must be at least 3 characters long')
      .required('Content is required'),
    postPhoto: isEdit
      ? Yup.mixed().nullable()
      : Yup.mixed().required('Photo is required'),
  });
