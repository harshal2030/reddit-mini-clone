import React from 'react';
import { Box, Flex, Link, Button } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{data, fetching}] = useMeQuery({pause: isServer()});
  const [{fetching: logoutFetching}, logout] = useLogoutMutation();

  let body = null;

  if (fetching) {
    body = null;
  } else if (!data?.me) {
    body = (
      <>
      <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
      </NextLink>
      </>
    )
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button onClick={() => logout()} isLoading={logoutFetching}>Logout</Button>
      </Flex>
    )
  }
  return (
    <Flex bg="tomato" p={4}>
      <Box ml="auto">
        {body}
      </Box>
    </Flex>
  )
}
