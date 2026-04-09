import service from "./axios";
 
export const get = (url, params) => {
    return service.get(url,{params})
}

export const post = (url, data) => {
    return service.post(url,data)
}

