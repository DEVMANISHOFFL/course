import React, { useEffect } from 'react'
import { Menu, School } from 'lucide-react'
// import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import DarkMode from '../DarkMode';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { useLogoutUserMutation } from '@/features/api/authApi';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    console.log(user);

    const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
    const navigate = useNavigate();
    const logoutHandler = async () => {
        await logoutUser();
    }
    useEffect(() => {
        if (isSuccess && data) {
            toast.success(data.message || "User logged Out.");
            navigate("/login")
        }
    }, [isSuccess])

    return (
        <div className='h-16 dark:bg-[#0A0A0A] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10 '>
            {/* Desktop */}
            <div className='max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full '>
                <div className=' flex items-center gap-2'>
                    <Link to="/">
                    <School size={"30"} />
                    </Link>
                    <Link to="/">
                    <h1 className='hidden md:block font-extrabold text-2xl'>E-Course</h1>
                    </Link>
                </div>
                <div className='flex items-center gap-8'>
                    {/* User Icon and dark mode Icon */}
                    {
                        user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Avatar>
                                        <AvatarImage src={user?.photoUrl || "https://github.com/shadcn.png"} />
                                        <AvatarFallback></AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem ><Link to="my-learning" >My Learnings</Link></DropdownMenuItem>
                                    <DropdownMenuItem> <Link to="profile">Edit Profile</Link></DropdownMenuItem>
                                    <DropdownMenuItem onClick={logoutHandler}>Log Out</DropdownMenuItem>
                                    {
                                        user.role === "instructor" && (
                                            <>  
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem><Link to="admin/dashboard">Dashboard</Link></DropdownMenuItem>
                                            </>
                                        )
                                    }

                                    {/* <DropdownMenuItem>Subscription</DropdownMenuItem> */}
                                </DropdownMenuContent>
                            </DropdownMenu>

                        ) : (
                            <div className='flex items-center gap-2'>
                                <Button variant="outline" onClick={() => navigate("/login")}>Login</Button>
                                <Button onClick={() => navigate("/login")}>Signup</Button>
                            </div>

                        )
                    }
                    <DarkMode />
                </div>
            </div>
            {/* Mobile Devices */}
            <div className=' flex md:hidden items-center justify-between px-4 h-full'>
                <h1 className='font-extrabold text-2xl'>E-Learning</h1>
                <MobileNavbar />

            </div>
        </div>

    )
}

export default Navbar;

const MobileNavbar = () => {
    const role = "instructor";
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size='icon' className='rounded-full bg-gray-0 hover:bg-gray-100' variant="outline">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
                <SheetHeader className="flex flex-row items-center justify-between mt-2">
                    <SheetTitle>E-Learning</SheetTitle>
                    <DarkMode />
                </SheetHeader>
                <Separator className='mr-2' />
                <nav className='flex flex-col space-y-4'>
                    <span>My Learnings</span>
                    <span>Edit Profile</span>
                    <p>Log Out</p >
                </nav>
                {
                    role === "instructor" && (
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button type="submit">Dashboard</Button>
                            </SheetClose>
                        </SheetFooter>
                    )
                }
            </SheetContent>
        </Sheet>

    )
}
