import React, { useState } from "react";
import useForm from "../../hooks/useForm.jsx";
import { register } from "../../services/authServices.js";
import useFetch from "../../hooks/useFetch.jsx";
import { useNavigate } from "react-router";




const RegisterScreen = () => {
    const navigate = useNavigate();
    const REGISTER_FORM_FIELDS = {
        USERNAME: 'username',
        EMAIL: 'email',
        PASSWORD: 'password',
    }
    const initial_form_state = {
        [REGISTER_FORM_FIELDS.USERNAME]: '',
        [REGISTER_FORM_FIELDS.EMAIL]: '',
        [REGISTER_FORM_FIELDS.PASSWORD]: '',
    }

    const { response, error, loading, sendRequest } = useFetch()

    const onRegister = (form_state_sent) => {

        const formData = new FormData();
        formData.append("username", form_state_sent.username);
        formData.append("email", form_state_sent.email);
        formData.append("password", form_state_sent.password);

        if (avatarFile) {
            formData.append("avatar", avatarFile);
        };


        sendRequest(() => register(formData));
    };

    const [avatarFile, setAvatarFile] = useState(null);
    const { form_state,
        onInputChange,
        handleSubmit,
        resetForm
    } = useForm(
        initial_form_state, onRegister
    )
    return (
        <div className="register-container">
            <h2 className="register-title">Registrate</h2>
            <form className="register-form" onSubmit={handleSubmit}>
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
                <div className="form-field">
                    <label htmlFor="avatar-image">Cargar Avatar:</label>
                    <input type="file" accept="image/*" placeholder='avatar-image' onChange={(e) => setAvatarFile(e.target.files[0])}
                    />
                </div>
                {error && <span style={{ color: 'red' }}>{error}</span>}
                {response && <span style={{ color: 'green' }}>Usuario registrado con exito</span>}
                {
                    loading
                        ? <button disabled className= "login-btn">Registrando</button>
                        : <button className= "register-btn">Registrarse</button>
                }
            </form>
            <button className= "login-btn" onClick={() => navigate("/login")}>Login</button>
        </div>
    )

}
export default RegisterScreen
