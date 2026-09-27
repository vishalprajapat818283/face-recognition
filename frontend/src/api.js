import axios from "axios";

const API_BASE_URL= import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});


export const registerPerson = async (
  name,
  images
) => {

  const formData = new FormData();

  formData.append(
    "name",
    name
  );

  images.forEach(
    (image, index) => {

      formData.append(
        "files",
        image,
        `face_${index + 1}.jpg`
      );

    }
  );

  const response = await api.post(
    "/api/register",
    formData
  );

  return response.data;
};


export const recognizeImage = async (
  file
) => {

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const response = await api.post(
    "/api/recognize",
    formData
  );

  return response.data;
};


export const getPeople = async () => {

  const response = await api.get(
    "/api/people"
  );

  return response.data;
};


export const updatePerson = async (
  id,
  name
) => {

  const formData = new FormData();

  formData.append(
    "name",
    name
  );

  const response = await api.patch(
    `/api/people/${id}`,
    formData
  );

  return response.data;
};


export const deletePerson = async (
  id
) => {

  const response = await api.delete(
    `/api/people/${id}`
  );

  return response.data;
};


export default api;