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

export const PlayerSchema = (isEdit) =>
  Yup.object().shape({
    name: Yup.string()
      .min(1, 'Name must be at least 1 character long')
      .max(30, 'Name must be less than 30 characters long')
      .required('Name is required'),
    surname: Yup.string()
      .min(1, 'Surname must be at least 1 character long')
      .max(30, 'Surname must be less than 30 characters long')
      .required('Surname is required'),
    age: Yup.number()
      .required('Age is required')
      .typeError('Age must be a number'),
    nationality: Yup.string().required('Nationality is required'),
    wantedTeam: Yup.string().required('Wanted team is required'),
    position: Yup.string().required('Position is required'),
    height: Yup.number()
      .required('Height is required')
      .typeError('Height must be a number'),
    weight: Yup.number()
      .required('Weight is required')
      .typeError('Weight must be a number'),
    number: Yup.number()
      .required('Number is required')
      .typeError('Number must be a number'),
    footed: Yup.string().required('Footed is required'),
    bio: Yup.string()
      .required('Bio is required')
      .max(150, 'Bio must be less than 150 characters long'),
    photo: isEdit
      ? Yup.mixed().nullable()
      : Yup.mixed().required('Photo is required'),
  });
