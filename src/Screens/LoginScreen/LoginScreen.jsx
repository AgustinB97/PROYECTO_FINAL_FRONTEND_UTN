import React, { useContext, useEffect } from 'react'
import { useLocation, useNavigate } from "react-router";
import useForm from '../../hooks/useForm';
import useFetch from '../../hooks/useFetch';
import { AuthContext } from '../../Context/AuthContext';
import { login } from '../../services/authServices';

const LoginScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onLogin } = useContext(AuthContext);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("from") === "verified_email") {
      alert("Has validado tu mail exitosamente");
    }
  }, []);

  const LOGIN_FORM_FIELDS = {
    EMAIL: 'email',
    PASSWORD: 'password'
  };

  const initial_form_state = {
    [LOGIN_FORM_FIELDS.EMAIL]: '',
    [LOGIN_FORM_FIELDS.PASSWORD]: ''
  };

  const { response, error, loading, sendRequest, resetResponse } = useFetch();

  function handleLogin(form_state_sent) {
    resetResponse();
    sendRequest(() => {
      return login(
        form_state_sent[LOGIN_FORM_FIELDS.EMAIL],
        form_state_sent[LOGIN_FORM_FIELDS.PASSWORD]
      );
    });
  }

  const {
    form_state,
    onInputChange,
    handleSubmit,
  } = useForm(initial_form_state, handleLogin);

  useEffect(() => {
    if (response && response.ok) {
      const token = response.body?.auth_token;
      const user = response.body?.user;

      if (token && user) {
        onLogin(token, user);
      } else {
        console.error(" Faltan token o user en la respuesta del backend");
      }
    }
  }, [response]);


  return (
    <div className="Form-container">
      <form onSubmit={handleSubmit}>
        
        <div className="form-field">
          <label htmlFor="email">Email: </label>
          <input
            type="text"
            placeholder="agus@algo.com"
            value={form_state.email}
            name="email"
            onChange={onInputChange}
          />
        </div>

        <div>
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            placeholder="*******"
            value={form_state.password}
            name="password"
            onChange={onInputChange}
          />
        </div>

        {error && <span style={{ color: "red" }}>{error}</span>}
        {response && response.ok && (
          <span style={{ color: "green" }}>Successful Login</span>
        )}

        {loading ? (
          <button disabled>Logging In...</button>
        ) : (
          <button>Login</button>
        )}
      </form>

      <button onClick={() => navigate("/register")}>Registrate</button>
    </div>
  );
};

export default LoginScreen;
