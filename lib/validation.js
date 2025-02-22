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

export const ProfileSchema = (isEdit) =>
  Yup.object().shape({
    name: Yup.string()
      .min(1, 'Name must be at least 1 character long')
      .max(30, 'Name must be less than 30 characters long')
      .required('Name is required'),
    surname: Yup.string()
      .min(1, 'Surname must be at least 1 character long')
      .max(30, 'Surname must be less than 30 characters long')
      .required('Surname is required'),
    birthDate: Yup.date().required('Birth date is required'),
    nationality: Yup.string().required('Nationality is required'),
    city: Yup.string().required('City is required'),
    bio: Yup.string().max(150, 'Bio must be less than 150 characters long'),
    photo: isEdit
      ? Yup.mixed().nullable()
      : Yup.mixed().required('Photo is required'),
  });
