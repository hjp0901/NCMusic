import axios from "axios";

const service = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
});
//请求拦截器
service.interceptors.request.use((config) => {
    //统一处理token
    return config
}, (error) => Promise.reject(error))

//相应拦截器
service.interceptors.response.use((response) => {
    const res = response.data
    return res
}, (error) => Promise.reject(error))

export default service