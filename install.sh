which -s brew
if [[ $? != 0 ]] 
then
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" &&
brew install node
fi

pwd | cat
npm i
