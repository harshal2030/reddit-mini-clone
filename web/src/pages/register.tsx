import React from 'react';
import {Form, Formik} from 'formik';
import {Box, Button} from '@chakra-ui/react';
import {useRouter} from 'next/router';

import {Wrapper} from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{username: '', password: ''}}
        onSubmit={async (value, {setErrors}) => {
          const response = await register(value);
          console.log(response.data);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push('/');
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField name="username" placeholder="username" label="username" />
            <Box mt={4}>
            <InputField name="password" placeholder="password" type="password" label="password" />
            </Box>

            <Button my={4} type="submit" isLoading={isSubmitting} variant="solid" bgColor="teal" textColor="#ffff">
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(Register);
