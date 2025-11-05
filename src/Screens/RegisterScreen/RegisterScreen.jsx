import React, { useState } from "react";
import useForm from "../../hooks/useForm.jsx";
import { register } from "../../services/authServices.js";
import useFetch from "../../hooks/useFetch.jsx";



const RegisterScreen = () => {
    //guardamos los campos que tendra  el form
    const REGISTER_FORM_FIELDS = {
        USERNAME: 'username',
        EMAIL: 'email',
        PASSWORD: 'password'
    }
    //guardamos el valor del estado inicial del form
    const initial_form_state = {
        [REGISTER_FORM_FIELDS.USERNAME]: '',
        [REGISTER_FORM_FIELDS.EMAIL]: '',
        [REGISTER_FORM_FIELDS.PASSWORD]: ''
    }

    const { response, error, loading, sendRequest } = useFetch()

    const onRegister = (form_state_sent) => {
        sendRequest(
            () => {
                return register(
                    form_state_sent[REGISTER_FORM_FIELDS.USERNAME],
                    form_state_sent[REGISTER_FORM_FIELDS.EMAIL],
                    form_state_sent[REGISTER_FORM_FIELDS.PASSWORD]
                )
            })
    }

    //alternativa: react hook forms /React formik
    const { form_state,
        onInputChange,
        handleSubmit,
        resetForm
    } = useForm(
        initial_form_state, onRegister
    )
    console.log(response)
    return (
        <div>
            <h1>Registrate</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="username">USUARIO:</label>
                    <input type="text" placeholder='name' value={form_state[REGISTER_FORM_FIELDS.USERNAME]} name={REGISTER_FORM_FIELDS.USERNAME} id={'username'} onChange={onInputChange} />
                </div>
                <div className="form-field">
                    <label htmlFor="email">Email:</label>
                    <input type="text" placeholder='example@gmail.com' value={form_state[REGISTER_FORM_FIELDS.EMAIL]} name={REGISTER_FORM_FIELDS.EMAIL} id={'email'} onChange={onInputChange} />
                </div>
                <div className="form-field">
                    <label htmlFor="password">Contrasenia:</label>
                    <input type="text" placeholder='password123' value={form_state[REGISTER_FORM_FIELDS.PASSWORD]} name={REGISTER_FORM_FIELDS.PASSWORD} id={'password'} onChange={onInputChange} />
                </div>
                {error && <span style={{ color: 'red' }}>{error}</span>}
                {response && <span style={{ color: 'green' }}>Usuario registrado con exito</span>}
                {
                    loading
                        ? <button disabled>Registrando</button>
                        : <button>Registrarse</button>
                }

            </form>
        </div>
    )

}
export default RegisterScreen
