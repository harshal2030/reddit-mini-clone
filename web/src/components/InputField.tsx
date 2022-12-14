import React, {InputHTMLAttributes} from 'react';
import {useField} from 'formik';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control';
import {Input} from '@chakra-ui/react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  placeholder: string;
}

export const InputField: React.FC<Props> = ({label, size: _, ...props}) => {
  const [field, { error }] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input {...field} {...props} id={field.name} placeholder={props.placeholder} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  )
}
