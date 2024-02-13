import { CheckCircleIcon } from '@chakra-ui/icons';
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
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function HomePage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);

  const { state } = useAuth();

  useEffect(() => {
    async function fetchProjects() {
      const projects = await dao.getAllProjects();
      setProjects(projects);
    }
    fetchProjects();
  }, []);

  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      github: '',
    },
    validationSchema: Yup.object({
      github: Yup.string().required('Required'),
    }),
    onSubmit: async (values, { setFieldError }) => {
      try {
        setIsLoading(true);
        const response = (await dao.createSubmission(
          BigInt(selectedId),
          values.github,
        )) as any;
        console.log(response);
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
            title: 'Project submitted.',
            description: 'Your project has been submitted successfully.',
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

  return (
    <Box>
      <TableContainer
        border={'1px'}
        borderColor={'gray.300'}
        rounded={'lg'}
        mx={'auto'}
        maxW={'5xl'}
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Title</Th>
              <Th>Creator</Th>
              <Th></Th>
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
                  <IconButton
                    aria-label="done"
                    icon={<CheckCircleIcon />}
                    variant={'ghost'}
                    size={'md'}
                    onClick={() => {
                      setSelectedId(index);
                      onOpen();
                    }}
                  />
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
          <ModalHeader>Submit Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={formik.handleSubmit}>
              <Box>
                <Stack gap={3} mb={5}>
                  <FormControl
                    id="github"
                    isInvalid={!!formik.errors.github && formik.touched.github}
                  >
                    <FormLabel>Github Repository Name</FormLabel>
                    <Input
                      value={formik.values.github}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      name="github"
                    />
                    <FormErrorMessage>{formik.errors.github}</FormErrorMessage>
                  </FormControl>
                  <Button type='submit' isLoading={isLoading} colorScheme="blue">Submit</Button>
                </Stack>
              </Box>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
