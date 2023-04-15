import {
  SERVER_URL,
  UNSPLASH_ACCESS_KEY,
  NOUNPROEJCT_ACCESS_KEY,
  NOUNPROJECT_SECRET_KEY,
} from "@env";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

const axiosInstance = axios.create({
  baseURL: SERVER_URL,
});

const unsplashInstance = axios.create({
  baseURL: "https://api.unsplash.com/",
  headers: {
    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
  },
});

const nounProjectInstance = axios.create({
  basURL: "https://api.thenounproject.com/v2",
  auth: {
    username: NOUNPROEJCT_ACCESS_KEY,
    password: NOUNPROJECT_SECRET_KEY,
  },
});

async function getImages() {
  try {
    const response = await unsplashInstance.get("/photos", {
      params: { per_page: 30 },
    });

    return response;
  } catch (err) {
    console.log(err);
  }
}

async function searchImages(query, page = 1, perPage = 30) {
  try {
    const response = await unsplashInstance.get("/search/photos", {
      params: { query, page, perPage },
    });

    return response;
  } catch (err) {
    console.log(err);
  }
}

async function getIcons(query, limit, size) {
  try {
    const response = await nounProjectInstance.get(
      `/icon?query=${query}&limit=${limit}$thumbnail_size=${size}`,
    );

    if (response.status === 200) {
      return response.data.icons;
    }
  } catch (err) {
    console.log(err);
  }
}

async function getIconsSVG(id, color, size) {
  try {
    const response = await nounProjectInstance.get(
      `/icon/${id}/download?color=${color}&filetype=svg&size=${size}`,
    );

    if (response.status === 200) {
      return response.data.base64_encoded_file;
    }
  } catch (err) {
    console.log(err);
  }
}

async function postSignIn(email, password) {
  try {
    const response = await axiosInstance.post("/api/auth/signin", {
      email,
      password,
    });

    if (response.status === 201) {
      await SecureStore.setItemAsync("token", response.data.token);
    }

    return response;
  } catch (err) {
    const error = err.response.status;

    if (error === 400) {
      Alert.alert("Failed login");
    }

    if (error === 500) {
      Alert.alert("Internal Server Error");
    }
  }
}

async function postSignUp(name, email, password) {
  try {
    const response = await axiosInstance.post("/api/auth/signup", {
      name,
      email,
      password,
    });

    return response;
  } catch (err) {
    console.log(err);
  }
}

async function getGifs() {
  try {
    const response = await axiosInstance.get("/api/assets/gifs");

    if (response.status === 200) {
      return response.data.gifURLs;
    }
  } catch (err) {
    console.log(err);
  }
}

async function getFonts() {
  try {
    const response = await axiosInstance.get("/api/assets/fonts");

    if (response.status === 200) {
      return response.data.fontURLs;
    }
  } catch (err) {
    console.log(err);
  }
}

export default {
  postSignUp,
  postSignIn,
  getGifs,
  getImages,
  searchImages,
  getFonts,
  getIcons,
  getIconsSVG,
};
