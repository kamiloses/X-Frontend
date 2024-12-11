import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import {User} from './models/user-model';
import {Subject} from 'rxjs';
import {UserActivityDto} from './models/friendStatus-model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient: any;
  public friendsOnline$ = new Subject<UserActivityDto>();

  connect(loggedUser:string |null): void {
    let ws = new SockJS('http://localhost:8084/ws');
    this.stompClient = Stomp.over(ws);


    this.stompClient.connect(
      { 'username': loggedUser },
      (frame: string) => {

        this.stompClient.send('/app/chat.activeFriends', {},loggedUser);



        this.stompClient.subscribe('/topic/public/friendsOnline', (message: any) => {
          const friendStatus: UserActivityDto = JSON.parse(message.body);
          this.onFriendsOnlineUpdate(friendStatus);
        });

      },
      (error: string) => {
        console.error('Connection error: ', error);
      }
    );
  }



  private onFriendsOnlineUpdate(userActivityDto: UserActivityDto): void {

    this.friendsOnline$.next(userActivityDto);
  }

  // private updateFriendsOnlineList(friendsOnline: string[]): void {
  // //  console.log('Friends Online:', friendsOnline);
  // }
  getStompClient() {
    return this.stompClient;
  }

  sendMessage(): void {

    // chatId: string, messageContent: string, senderUsername: string
    // const message = {
    //   chatId: chatId,
    //   senderUsername: senderUsername,
    //   content: messageContent
    // };
    this.stompClient.send('/app/chat.sendMessage', {},"test" );
  }
// JSON.stringify(message)

}
