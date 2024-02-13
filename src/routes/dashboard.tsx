'use client';

import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  Input,
  FormLabel,
  Stack,
  useToast,
  FormErrorMessage,
  Spinner,
  useColorMode,
} from '@chakra-ui/react';
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiUser,
  FiBook,
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { NavLink, Outlet, useNavigate, useNavigation } from 'react-router-dom';
import { dao } from '../declarations/dao';
import { useEffect, useState } from 'react';
import { Actor, AnonymousIdentity, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Member } from '../declarations/dao/dao.did';
import { LOGIN, useAuth } from '../lib/AuthContext';
import { createClient, getRole } from '../lib/helper';
import withAuth from '../lib/withAuth';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FaUserAstronaut, FaUsers } from 'react-icons/fa6';

interface LinkItemProps {
  name: string;
  to: string;
  icon: IconType;
}

interface NavItemProps extends FlexProps {
  icon: IconType;
  to: string;
  children: React.ReactNode;
}

interface MobileProps extends FlexProps {
  onOpen: () => void;
  onOpenModal: () => void;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', icon: FiHome, to: '/dashboard' },
  { name: 'About', icon: FiCompass, to: '/dashboard/about' },
  { name: 'Profile', icon: FiUser, to: '/dashboard/profile' },
  { name: 'Proposals', icon: FiStar, to: '/dashboard/proposals' },
  { name: 'Members', icon: FaUsers, to: '/dashboard/members' },
  { name: 'Projects', icon: FaUserAstronaut, to: '/dashboard/projects' },
];

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          LearnIC DAO
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem to={link.to} key={link.name} icon={link.icon}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

const NavItem = ({ icon, children, to, ...rest }: NavItemProps) => {
  const { state } = useAuth();
  return (
    <Box style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <NavLink
        to={state.user?.member ? to : '#'}
        className={({ isActive, isPending }) =>
          isActive ? 'active' : isPending ? 'pending' : ''
        }
      >
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            bg: 'cyan.400',
            color: 'white',
            transition: '0.3s',
          }}
          bg={
            to === window.location.pathname ? 'cyan.400' : 'transparent'
          }
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{
                color: 'white',
              }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      </NavLink>
    </Box>
  );
};

let actor = dao;

const MobileNav = ({ onOpen, onOpenModal, ...rest }: MobileProps) => {
  const { state } = useAuth();
  const navigation = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        LearnIC DAO
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <IconButton
          onClick={toggleColorMode}
          size="lg"
          variant="ghost"
          aria-label="toggle theme"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        />
        <Flex alignItems={'center'}>
          {!state.user?.member ? (
            <Button
              onClick={onOpenModal}
              leftIcon={<FiUser />}
              colorScheme="blue"
            >
              Become a member
            </Button>
          ) : (
            <Menu>
              <MenuButton
                py={2}
                transition="all 0.3s"
                _focus={{ boxShadow: 'none' }}
              >
                <HStack>
                  <Avatar
                    size={'sm'}
                    src={
                      'https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                    }
                  />
                  <VStack
                    display={{ base: 'none', md: 'flex' }}
                    alignItems="flex-start"
                    spacing="1px"
                    ml="2"
                  >
                    <Text fontSize="sm">{state.user?.member.name}</Text>
                    <Text fontSize="xs" color="gray.600">
                      {getRole(state.user?.member)}
                    </Text>
                  </VStack>
                  <Box display={{ base: 'none', md: 'flex' }}>
                    <FiChevronDown />
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList
                bg={useColorModeValue('white', 'gray.900')}
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <MenuItem
                  onClick={() => {
                    navigation('/dashboard/profile');
                  }}
                >
                  Profile
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  onClick={async () => {
                    const authClient = await createClient();
                    toast({
                      title: 'Signing out',
                      description: 'You are now signed out.',
                      status: 'info',
                      duration: 9000,
                      isClosable: true,
                      position: 'top',
                    });
                    localStorage.clear();
                    sessionStorage.clear();
                    indexedDB.deleteDatabase('icp');
                    authClient.logout();
                    navigation('/');
                  }}
                >
                  Sign out
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </HStack>
    </Flex>
  );
};

const DashboardRoot = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { state, dispatch } = useAuth();

  const formik = useFormik({
    initialValues: {
      name: '',
      github: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      github: Yup.string().required('Required'),
    }),
    onSubmit: async (values, { setFieldError }) => {
      try {
        setIsLoading(true);
        const response = (await actor.registerMember(
          values.name,
          values.github,
        )) as any;
        setIsLoading(false);
        if (response.ok == null) {
          onCloseModal();
          toast({
            title: 'Member created.',
            description: 'You are now a member of LearnIC DAO.',
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'top',
          });
          const authClient = await AuthClient.create({
            idleOptions: {
              idleTimeout: 1000 * 60 * 30,
            },
          });
          const identity = authClient.getIdentity();
          const member = (await actor.getMember(
            identity.getPrincipal(),
          )) as any;
          if (member.ok) {
            dispatch({
              type: LOGIN,
              payload: {
                principal: identity.getPrincipal(),
                member: member.ok as Member,
              },
            });
          }
        } else {
          setFieldError('name', response.err);
        }
      } catch (e: unknown) {
        toast({
          title: 'An error occurred.',
          description: (e as any).toString(),
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top',
        });
      }
    },
  });

  const navigation = useNavigation();

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} onOpenModal={onOpenModal} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {navigation.state === 'loading' ? (
          <Box>
            <Spinner />
          </Box>
        ) : (
          <>{state.user?.member ? <Outlet /> : <Text>Not a member</Text>}</>
        )}
      </Box>

      <Modal isOpen={isOpenModal} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Become A Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={5}>
              Provide your name and Github repo to become a LearnIC DAO member.
            </Text>
            <form onSubmit={formik.handleSubmit}>
              <Stack gap={3}>
                <FormControl
                  id="name"
                  isInvalid={!!formik.errors.name && formik.touched.name}
                >
                  <FormLabel>Your Name</FormLabel>
                  <Input
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="name"
                  />
                  <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
                </FormControl>
                <FormControl
                  id="github"
                  isInvalid={!!formik.errors.github && formik.touched.github}
                >
                  <FormLabel>Your Github</FormLabel>
                  <Input
                    value={formik.values.github}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="github"
                  />
                  <FormErrorMessage>{formik.errors.github}</FormErrorMessage>
                </FormControl>
              </Stack>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={formik.submitForm}
              isLoading={isLoading}
              variant="outline"
              colorScheme="green"
            >
              Create Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const withDash = withAuth(DashboardRoot);

export default withDash;
