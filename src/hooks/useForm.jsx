import { useState } from "react"

//Tiene la responsabilidad de manejar el estado de formulario a lo largo de mi app
const useForm = (initial_form_state, onSubmit) => {
    //Estado con los valores del formulario
    const [form_state, setFormState] = useState(initial_form_state)


    const onInputChange = (event) => {
        const field = event.target
        const field_name = field.name
        const field_value = field.value
        setFormState(
            (prevFormState) => {
                return { ...prevFormState, [field_name]: field_value }
            }
        )
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        onSubmit(form_state)

    }

    const resetForm = () => {
        setFormState(initial_form_state)
    }

    return {
        form_state,
        onInputChange,
        handleSubmit,
        resetForm
    }

}

export default useForm