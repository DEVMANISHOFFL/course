import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";


// const USER_API = "http://localhost:8080/api/v1/user/"
// const USER_API = import.meta.env.VITE_API_URL || "https://course-mjvb.vercel.app/?vercelToolbarCode=8oiaLgnqfopqjRW";
// const USER_API = import.meta.env.VITE_API_URL || "https://course-mjvb.vercel.app/?vercelToolbarCode=8oiaLgnqfopqjRW/api/v1/user";
const USER_API = import.meta.env.VITE_API_URL || "https://course-mjvb.vercel.app/api/v1/user";



// Use USER_API in the baseQuery


export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:USER_API,   
        credentials:'include'
    }), 
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url:"register",
                method:"POST",
                body:inputData
            })
        }),
        loginUser: builder.mutation({
            query: (inputData) => ({
                url:"login",
                method:"POST",
                body:inputData
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url:"logout",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try { 
                    dispatch(userLoggedOut());
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        loadUser: builder.query({
            query: () => ({
                url:"profile",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url:"profile/update",
                method:"PUT",
                body:formData
            })
        })
    })
});
export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation
} = authApi;
