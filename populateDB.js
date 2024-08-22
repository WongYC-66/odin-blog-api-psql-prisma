const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const bcrypt = require('bcrypt')

if (process.env.NODE_ENV !== 'production')
    require('dotenv').config()

const main = async () => {
    console.log("starting to populate db...")

    const user1 = await prisma.user.create({
        data: {
            username: 'admin1',
            password: bcrypt.hashSync('admin1', 10),
            isAdmin: true,
            posts: {
                create: [
                    {
                        title: 'Admin 1\'s new Post 1',
                        contents: 'This is a testing post, this is contents section',
                        isPublished: true,
                        timestamp: new Date(),
                    },
                    {
                        title: 'Admin 1\'s new Post 2',
                        contents: 'post 2 contents',
                        isPublished: true,
                        timestamp: new Date(),
                    },
                    {
                        title: 'Admin 1\'s new Post 3 - Other people shall not see this',
                        contents: 'Only admin1 can see his/her own un-published post',
                        isPublished: false,
                        timestamp: new Date(),
                    },
                ]
            }
        },
    })

    const post1 = await prisma.post.findFirst({
        where: {
            user: user1.id,
        },
    });

    await prisma.post.update({
        where: { id: post1.id },
        data: {
            comments: {
                create: [
                    { text: 'Hi, this is admin\'s comment', timestamp: new Date(), user: user1.id },
                    { text: 'Hi, this is admin\'s 2nd comment', timestamp: new Date(), user: user1.id }
                ]
            }
        }
    })

    const user2 = await prisma.user.create({
        data: {
            username: 'admin2',
            password: bcrypt.hashSync('admin2', 10),
            isAdmin: true,
        },
    })

    const user3 = await prisma.user.create({
        data: {
            username: 'user1',
            password: bcrypt.hashSync('user1', 10),
            isAdmin: false,
        },
    })

    console.log("done populating db...")
}

main()
    .catch(e => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });