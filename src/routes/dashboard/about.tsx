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
  Text,
} from '@chakra-ui/react';
import { Stats } from '../../declarations/dao/dao.did';
import { useEffect, useState } from 'react';
import { dao } from '../../declarations/dao';

export default function AboutPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const stats = await dao.getStats();
      setStats(stats);
    }
    fetchStats();
  }, []);

  return (
    <Box>
      <Center>
        <Card maxW={'2xl'}>
          <CardBody>
            <Box textAlign={'center'} mb={5}>
              <Image
                src={stats?.logo}
                width={'100px'}
                display={'block'}
                mx={'auto'}
                mb={3}
              />
              <Heading size={'lg'}>{stats?.name}</Heading>
            </Box>
            {stats && stats?.picture && (
              <Image
                src={stats.picture}
                width={'100%'}
                display={'block'}
                mb={5}
              />
            )}

            <Text mb={5}>{stats?.manifesto}</Text>
            <Box>
              <Text
                display={'flex'}
                align={'center'}
                justifyContent={'space-between'}
              >
                <span
                  style={{
                    fontWeight: 500,
                  }}
                >
                  Members
                </span>{' '}
                {stats?.numberOfMembers.toString()}
              </Text>
              <Text
                display={'flex'}
                align={'center'}
                justifyContent={'space-between'}
              >
                <span
                  style={{
                    fontWeight: 500,
                  }}
                >
                  DAO Social Link
                </span>{' '}
                {stats?.socialLinkDAO}
              </Text>
              <Text
                display={'flex'}
                align={'center'}
                justifyContent={'space-between'}
              >
                <span
                  style={{
                    fontWeight: 500,
                  }}
                >
                  Creator Social Link
                </span>{' '}
                {stats?.socialLinkBuilder}
              </Text>
            </Box>
          </CardBody>
        </Card>
      </Center>
    </Box>
  );
}
