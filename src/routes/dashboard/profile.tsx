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
} from '@chakra-ui/react';
import { useAuth } from '../../lib/AuthContext';
import { useEffect, useState } from 'react';
import { Submission } from '../../declarations/dao/dao.did';
import { dao } from '../../declarations/dao';
import { token } from '../../declarations/token';
import { Principal } from '@dfinity/principal';

export default function ProfilePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const { state } = useAuth();
  useEffect(() => {
    async function fetchSubmissions() {
      const projects = await dao.getSubmissions(
        state.user?.principal.toString() as string,
      );
      setSubmissions(projects);
      const balance = await token.balanceOf(state.user?.principal as Principal);
      const tokenSymbol = await token.tokenSymbol();
      setBalance(parseFloat(balance.toString()));
      setTokenSymbol(tokenSymbol);
    }
    fetchSubmissions();
  }, []);
  return (
    <Box>
      <Card mb={5} w={'lg'}>
        <CardBody>
          <Stack gap={3}>
            <Text
              display={'flex'}
              align={'center'}
              justifyContent={'space-between'}
              gap={5}
            >
              <span
                style={{
                  fontWeight: 500,
                }}
              >
                Name
              </span>{' '}
              {state.user?.member.name}
            </Text>
            <Text
              display={'flex'}
              align={'center'}
              justifyContent={'space-between'}
              gap={5}
            >
              <span
                style={{
                  fontWeight: 500,
                }}
              >
                Principal
              </span>{' '}
              <span
                style={{
                  textAlign: 'right',
                }}
              >
                {state.user?.principal.toString()}
              </span>
            </Text>
            <Text
              display={'flex'}
              align={'center'}
              justifyContent={'space-between'}
              gap={5}
            >
              <span
                style={{
                  fontWeight: 500,
                }}
              >
                Submissions
              </span>{' '}
              {submissions.length}
            </Text>
            <Text
              display={'flex'}
              align={'center'}
              justifyContent={'space-between'}
              gap={5}
            >
              <span
                style={{
                  fontWeight: 500,
                }}
              >
                Balance
              </span>{' '}
              {balance} {tokenSymbol}
            </Text>
          </Stack>
        </CardBody>
      </Card>
      <TableContainer
        maxW={'3xl'}
        border={'1px'}
        borderColor={'gray.300'}
        rounded={'lg'}
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>URL</Th>
              <Th>Project</Th>
            </Tr>
          </Thead>
          <Tbody>
            {submissions.map((submission, index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                <Td>{submission.url}</Td>
                <Td>{submission.project.toString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {submissions.length === 0 && (
        <Text fontSize={'xl'} mt={5}>No submissions yet</Text>
      )}
    </Box>
  );
}
