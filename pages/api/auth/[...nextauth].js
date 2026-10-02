import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
export const authOptions = {
    providers:[
        GithubProvider({
            clientId:"Ov23li0O88ZWobEm09Df",

            clientSecret:"1d432cc2aeb1ba8ff4569ecb57dbe0f205bbeff2",
        }),

    ],
};
export default NextAuth(authOptions);