import toast from 'react-hot-toast'
import { authenicate } from './helper';

//validate login page username
export async function usernameValidate(values){
    const errors = usernameVerify({} , values);

    if(values.username){
        //check user exist or not
        const {status} = await authenicate(values.username)

        if(status !== 200){
            errors.exist = toast.error("User does not exist...!")
        }
    }

    return errors;
}

//validate password for password page

export async function passwordValidate(values){
    const errors = passwordVerify({} , values);

    return errors;
}

//validate rest password for reset page

export async function resetPasswordValidation(values){
    const errors = passwordVerify({} , values);

    if(values.password !== values.confirm_pwd){
        errors.exist = toast.error("Password not match...!");
    }
    return errors
}

//validate register form

export async function registerValidation (values){
    const errors = usernameVerify({}, values );
    passwordVerify(errors , values);
    emailVerify(errors,values);

    return errors;
}

// validaTE PROFILE

export async function profileValidation(values){
    const errors = emailVerify({} , values);
    return errors;
}

// validate password

function passwordVerify (errors = {} , values){

    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    if(!values.password){
        errors.password = toast.error("Password Required...!");
    } else if(values.password.includes(" ")){
        errors.password = toast.error("Wrong Password...!");
    } else if(values.password.length < 4){
        errors.password = toast.error("Password must be more than 4 characters");
    } else if(!specialChars.test(values.password)){
        errors.password = toast.error("Password must have special Characters")
    }
    return errors;
}

// validate reset password


// validate username
function usernameVerify (error = {} , values){
    if(!values.username){
        error.username= toast.error("Username Required...!");
    }
    else if(values.username.includes(" ")){
        error.username = toast.error("Invalid Username...!")
    }
    return error;
}

// validate email

function emailVerify(error = {} , values){
    if(!values.email){
        error.email = toast.error("Email Required...!");
    }else if(values.email.includes(" ")){
        error.email = toast.error("Wrong Email..!");
    }else if(!/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(values.email)){
        error.email = toast.error("Invalid email address...!");
    }
    return error;
}