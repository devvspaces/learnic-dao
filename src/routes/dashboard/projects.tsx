import { AddIcon, CheckCircleIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Input,
  HStack,
  Select,
  FormLabel,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Progress,
  IconButton,
  FormControl,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Project } from '../../declarations/dao/dao.did';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { dao } from '../../declarations/dao';
import moment from 'moment';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function ProjectsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { state } = useAuth();

  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      name: '',
      github: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      github: Yup.string().url('Must be a valid url').required('Required'),
    }),
    onSubmit: async (values, { setFieldError }) => {
      try {
        setIsLoading(true);
        const response = (await dao.createProject(
          values.name,
          values.github,
        )) as any;
        setIsLoading(false);
        if (response.err) {
          toast({
            title: 'An error occurred.',
            description: response.err,
            status: 'error',
            duration: 9000,
            isClosable: true,
            position: 'top',
          });
        } else {
          onClose();
          toast({
            title: 'Project created successfully.',
            description: 'You can now see the project in the list.',
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'top',
          });
        }
      } catch (e: unknown) {
        toast({
          title: 'Try again later.',
          description: (e as any).toString(),
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top',
        });
      }
    },
  });

  useEffect(() => {
    async function fetchProjects() {
      const projects = await dao.getAllProjects();
      setProjects(projects);
    }
    fetchProjects();
  }, [isLoading]);
  return (
    <Box>
      <Button onClick={onOpen} mb={5} colorScheme="blue" leftIcon={<AddIcon />}>
        Create New Project
      </Button>
      <TableContainer
        border={'1px'}
        borderColor={'gray.300'}
        rounded={'lg'}
        maxW={'5xl'}
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Title</Th>
              <Th>Creator</Th>
              <Th>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
            {projects.map((project, index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                <Td>
                  <Text color="blue">
                    <a target="_blank" href={project.url}>
                      {project.name}
                    </a>
                  </Text>
                </Td>
                <Td>
                  <Text color="blue">
                    <Link
                      to={`/dashboard/members/${project.mentor.toString()}`}
                    >
                      {project.mentor.toString()}
                    </Link>
                  </Text>
                </Td>
                <Td>
                  {moment(
                    new Date(parseInt(project.created.toString()) / 1000000),
                  ).format('MMM Do, YYYY h:mm A')}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {projects.length === 0 && (
        <Center>
          <Text fontSize={'2rem'} mt={7}>
            No projects available currently
          </Text>
        </Center>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box>
              <form onSubmit={formik.handleSubmit}>
                <Stack gap={3} mb={5}>
                  <FormControl
                    id="name"
                    isInvalid={!!formik.errors.name && formik.touched.name}
                  >
                    <FormLabel>Project Name</FormLabel>
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
                    <FormLabel>Github Repository URL</FormLabel>
                    <Input
                      value={formik.values.github}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      name="github"
                    />
                    <FormErrorMessage>{formik.errors.github}</FormErrorMessage>
                  </FormControl>
                  <Button isLoading={isLoading} type="submit" colorScheme="blue">
                    Create Project
                  </Button>
                </Stack>
              </form>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
