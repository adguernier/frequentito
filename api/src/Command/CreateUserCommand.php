<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Create a user with command line',
)]
class CreateUserCommand extends Command
{
    public function __construct(private UserPasswordHasherInterface $userPasswordHasherInterface, private EntityManagerInterface $entityManagerInterface)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'The user\'s email')
            ->addArgument('password', InputArgument::REQUIRED, 'The user\'s password')
            ->addArgument('roles', InputArgument::IS_ARRAY, 'The user\'s roles (separate by spaces)');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');
        $password = $input->getArgument('password');
        $roles = $input->getArgument('roles');

        $user = new User();
        $user
            ->setEmail($email)
            ->setPassword($this->userPasswordHasherInterface->hashPassword($user, $password))
            ->setRoles($roles);

        $this->entityManagerInterface->persist($user);
        $this->entityManagerInterface->flush();

        $io->success(sprintf('You have created a new user with email %s', $email));

        return Command::SUCCESS;
    }
}
