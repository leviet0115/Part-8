git add .
if [-z "$1"] 
then echo "Need comment"
else git commit -m $1
fi

