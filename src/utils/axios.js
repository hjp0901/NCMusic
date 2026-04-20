import axios from "axios";

const service = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
});
//请求拦截器
service.interceptors.request.use((config) => {
//   统一处理token
//   const token = localStorage.getItem("token");
//   if (token) {
//     // 后端一般要求格式：Bearer 空格 + Token
//     config.headers["Authorization"] = "Bearer " + token;
//     // 有些后端直接用 token: xxx
//     // config.headers['token'] = token
//   }
  return config;
}, (error) => Promise.reject(error))

//相应拦截器
service.interceptors.response.use((response) => {
    const res = response.data
    return res
}, (error) => Promise.reject(error))

export default service