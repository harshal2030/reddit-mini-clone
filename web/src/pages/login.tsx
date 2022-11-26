import React from 'react';
import {Form, Formik} from 'formik';
import {Box, Button} from '@chakra-ui/react';
import {useRouter} from 'next/router';

import {Wrapper} from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{username: '', password: ''}}
        onSubmit={async (value, {setErrors}) => {
          const response = await login({ options: value });
          console.log(response.data);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
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
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(Login);
