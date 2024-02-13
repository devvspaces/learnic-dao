import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Avatar,
  HStack,
  Container,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Outlet, redirect, useNavigate, useNavigation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, AnonymousIdentity, HttpAgent, Identity } from '@dfinity/agent';
import { createActor, dao } from '../declarations/dao';

let actor = dao;

export default function Root() {
  const [principal, setPrincipal] = useState<string | null>(null);

  const navigation = useNavigate();

  function refreshIdentity(identity: Identity) {
    setPrincipal(identity.getPrincipal().toString());
    const agent = Actor.agentOf(actor);
    if (!agent || !agent.replaceIdentity) {
      throw new Error('Agent not found');
    }
    agent.replaceIdentity(identity);
  }

  async function login() {
    const authClient = await AuthClient.create({
      idleOptions: {
        idleTimeout: 1000 * 60 * 30,
      },
    });
    if (!process.env.CANISTER_ID_DAO) {
      console.error('Project not found');
      return;
    }
    await new Promise((resolve) => {
      authClient.login({
        identityProvider:
          process.env.DFX_NETWORK === 'ic'
            ? 'https://identity.ic0.app'
            : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`,
        onSuccess: () => resolve(null),
      });
    });
    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    actor = createActor(process.env.CANISTER_ID_DAO, {
      agent,
    });
    refreshIdentity(identity);
    navigation('/dashboard');
  }

  useEffect(() => {
    async function checkLoggedIn() {
      const authClient = await AuthClient.create({
        idleOptions: {
          idleTimeout: 1000 * 60 * 30,
        },
      });
      const identity = authClient.getIdentity();
      if (
        identity.getPrincipal().toString() !==
        new AnonymousIdentity().getPrincipal().toString()
      ) {
        refreshIdentity(identity);
        navigation('/dashboard');
      }
    }
    checkLoggedIn();
  });

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: '2rem', md: '14rem' }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <HStack>
            <Avatar src="https://cryptologos.cc/logos/internet-computer-icp-logo.png" />
            <Text
              textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
              fontFamily={'heading'}
              color={useColorModeValue('gray.800', 'white')}
            >
              LearnIC DAO
            </Text>
          </HStack>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          <Button
            as={'a'}
            display="inline-flex"
            fontSize={'sm'}
            fontWeight={600}
            color={'white'}
            bg={'pink.400'}
            href={'#'}
            _hover={{
              bg: 'pink.300',
            }}
            onClick={login}
          >
            Sign In
          </Button>
        </Stack>
      </Flex>

      <Container maxW={'8xl'}>
        <Outlet />
      </Container>
    </Box>
  );
}
