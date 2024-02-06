# metaScore-library Contribution Guide

Thank you for your interest in contributing to the metaScore-library project.  
Contributions are welcomed and highly encouraged. 

If you are thinking of fixing a bug or adding a new feature, please first discuss with us the change you want to make by [opeing an issue](https://github.com/philharmoniedeparis/metascore-library/issues/new).

## Creating a Pull Request

To create a pull request, you first need to create a fork of the [metascore-library](https://github.com/philharmoniedeparis/metascore-library/) repository to commit your changes to it.  
Methods to fork a repository can be found in the [GitHub Documentation](https://docs.github.com/en/get-started/quickstart/fork-a-repo).

Then, go to the local directory

```sh
cd metascore-library
```

add git remote controls:

```sh
# Using HTTPS
git remote add fork https://github.com/YOUR-USERNAME/metascore-library.git
git remote add upstream https://github.com/philharmoniedeparis/metascore-library.git


# Using SSH
git remote add fork git@github.com:YOUR-USERNAME/metascore-library.git
git remote add upstream git@github.com/philharmoniedeparis/metascore-library.git
```

### Receiving remote updates
In view of staying up to date with the central repository :

```sh
git pull upstream master
```

### Choosing a base branch
Before starting development, you need to know which branch to base your modifications/additions on. When in doubt, use master.

| Type of change                |           | Branches              |
| :------------------           |:---------:| ---------------------:|
| Documentation                 |           | `master`              |
| Bug fixes                     |           | `master`              |
| New features                  |           | `master`              |
| New issues models             |           | `YOUR-USERNAME:patch` |

```sh
# Switch to the desired branch
git switch master

# Pull down any upstream changes
git pull

# Create a new branch to work on
git switch --create fix/1234-issue-name
```

Commit your changes, then push the branch to your fork with `git push -u fork` and open a pull request on [the metaScore-library repository](https://github.com/philharmoniedeparis/metascore-library/).