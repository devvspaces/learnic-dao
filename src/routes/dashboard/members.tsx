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
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { Member } from '../../declarations/dao/dao.did';
import { dao } from '../../declarations/dao';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { Role, getRole } from '../../lib/helper';
import {
  Form,
  Link,
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useSubmit,
} from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { Search2Icon } from '@chakra-ui/icons';
import { FaUserGraduate } from 'react-icons/fa6';

export async function membersLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search');
  const role = url.searchParams.get('role');
  let members = await dao.getMembers();
  if (search) {
    members = members.filter((member) => {
      return member[1].name.toLowerCase().includes(search.toLowerCase());
    });
  }
  if (role) {
    members = members.filter((member) => {
      return getRole(member[1])?.toString() == role;
    });
  }
  return {
    members,
    search,
    role,
  };
}

export default function MemberPage() {
  const { members, search, role } = useLoaderData() as {
    members: [Principal, Member][];
    search: string;
    role: string;
  };
  const [query, setQuery] = useState(search);
  const [roleQuery, setRoleQuery] = useState(role);

  const toast = useToast();

  useEffect(() => {
    setQuery(search);
    setRoleQuery(role);
  }, [search, role]);

  return (
    <Box>
      <Box mb={'4rem'} maxW={'500px'} mx={'auto'}>
        <Heading mb={5} size={'lg'} textAlign={'center'}>
          Filter DAO Members
        </Heading>
        <Form id="search-form" role="search">
          <HStack gap={3}>
            <Input
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              id="search"
              defaultValue={query}
              size={'lg'}
              name="search"
              placeholder="Search by name"
            />
            <Select
              defaultValue={roleQuery}
              name="role"
              size={'lg'}
              placeholder="Select option"
              onChange={(e) => {
                setRoleQuery(e.target.value);
              }}
            >
              <option value="Student">Student</option>
              <option value="Graduate">Graduate</option>
              <option value="Mentor">Mentor</option>
            </Select>
            <IconButton
              aria-label="search"
              colorScheme="blue"
              icon={<Search2Icon />}
              type="submit"
            />
          </HStack>
        </Form>
      </Box>
      <TableContainer
        maxW={'3xl'}
        border={'1px'}
        borderColor={'gray.300'}
        rounded={'lg'}
        mx={'auto'}
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {members.map((member, index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                <Td>
                  <Link
                    style={{
                      color: 'blue',
                    }}
                    to={`/dashboard/members/${member[0].toString()}`}
                  >
                    {member[1].name}
                  </Link>
                </Td>
                <Td>{getRole(member[1])}</Td>
                <Td>
                  <HStack>
                    <Tooltip label={getRole(member[1]) !== Role.Student ? "Not a student anymore" : "Make a graduate"}>
                      <IconButton
                        onClick={async () => {
                          const response = await dao.graduate(member[0]) as any;
                          if (response.err) {
                            toast({
                              title: 'Error',
                              description: response.err,
                              status: 'error',
                              duration: 3000,
                              isClosable: true,
                            });
                          } else {
                            toast({
                              title: 'Success',
                              description: 'Graduated successfully',
                              status: 'success',
                              duration: 3000,
                              isClosable: true,
                            });
                          }
                        }}
                        aria-label="graduate"
                        icon={<FaUserGraduate />}
                        colorScheme="blue"
                        size={'sm'}
                        isDisabled={getRole(member[1]) !== Role.Student}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
