import { useEffect } from 'react'
import { Image, View } from 'react-native'
import Logo from '../assets/images/splash-icon2.png'
import { useNavigation } from '@react-navigation/core'

const DefaultScreen = () => {
    const navigation = useNavigation()
    useEffect(() => {
        setTimeout(() => {
            navigation.navigate("login");
        }, 2000);
    }, [])

    return (

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#34BF02" }}>
            <Image source={Logo} style={{height:100,width:200}} />
        </View>

    )
}

export default DefaultScreen